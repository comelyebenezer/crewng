// backend/src/routes/wallet.js
const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { requireAuth } = require('../middleware/auth')
const { decrypt } = require('../utils/encrypt')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/wallet — Get my wallet
router.get('/', requireAuth, async (req, res) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.user.id },
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!wallet) return res.status(404).json({ error: 'Wallet not found.' })
    res.json({ wallet })
  } catch {
    res.status(500).json({ error: 'Failed to load wallet.' })
  }
})

// POST /api/wallet/withdraw — Withdraw to bank
router.post('/withdraw', requireAuth, async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Invalid amount.' })

    const wallet = await prisma.wallet.findUnique({ where: { userId: req.user.id } })
    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance.' })
    }

    const bankAccount = await prisma.bankAccount.findUnique({ where: { userId: req.user.id } })
    if (!bankAccount) return res.status(400).json({ error: 'No bank account linked. Please add your bank details.' })

    // In production: call Paystack Transfer API here
    // const bankName = decrypt(bankAccount.bankNameEncrypted)
    // const accNum = decrypt(bankAccount.accountNumEncrypted)

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { userId: req.user.id },
        data: { balance: { decrement: amount }, totalWithdrawn: { increment: amount } },
      })
      await tx.transaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount,
          status: 'HELD',
          reference: `WD-${req.user.id}-${Date.now()}`,
          description: 'Withdrawal to bank account',
        },
      })
    })

    res.json({ message: `₦${amount.toLocaleString()} withdrawal initiated. Arrives in 1-2 business days.` })
  } catch (err) {
    res.status(500).json({ error: 'Withdrawal failed.' })
  }
})

// POST /api/wallet/bank-account — Add/update bank account
router.post('/bank-account', requireAuth, async (req, res) => {
  try {
    const { bankName, accountNum, accountName } = req.body
    if (!bankName || !accountNum || !accountName) {
      return res.status(400).json({ error: 'Bank name, account number and account name required.' })
    }
    if (accountNum.replace(/\D/g, '').length !== 10) {
      return res.status(400).json({ error: 'Account number must be 10 digits.' })
    }

    const { encrypt } = require('../utils/encrypt')
    const data = {
      bankNameEncrypted: encrypt(bankName),
      accountNumEncrypted: encrypt(accountNum),
      accountNameEncrypted: encrypt(accountName),
    }

    await prisma.bankAccount.upsert({
      where: { userId: req.user.id },
      update: data,
      create: { userId: req.user.id, ...data },
    })

    res.json({ message: 'Bank account saved.' })
  } catch (err) {
    res.status(500).json({ error: 'Failed to save bank account.' })
  }
})

module.exports = router
