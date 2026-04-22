// backend/src/utils/email.js
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

async function sendResetEmail(email, resetLink) {
  await transporter.sendMail({
    from: `"CrewNG" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your CrewNG Password',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#f5c842">CrewNG Password Reset</h2>
        <p style="color:rgba(255,255,255,.7);margin:16px 0">Click the button below to reset your password. This link expires in <strong>15 minutes</strong>.</p>
        <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#f5c842,#e6a817);color:#000;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-family:sans-serif;margin:16px 0">Reset Password</a>
        <p style="color:rgba(255,255,255,.4);font-size:12px;margin-top:24px">If you didn't request this, you can safely ignore this email. Your password will not change.</p>
      </div>
    `,
  })
}

async function sendBookingConfirmation(email, booking) {
  await transporter.sendMail({
    from: `"CrewNG" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Booking Confirmed - ${booking.eventName}`,
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:#22c55e">✅ Booking Confirmed!</h2>
        <p style="color:rgba(255,255,255,.7)">Your booking for <strong>${booking.eventName}</strong> has been confirmed.</p>
        <div style="background:#1a1a1a;border-radius:12px;padding:16px;margin:16px 0">
          <p><strong>Professional:</strong> ${booking.workerName}</p>
          <p><strong>Event:</strong> ${booking.eventName}</p>
          <p><strong>Venue:</strong> ${booking.location}</p>
          <p><strong>Date(s):</strong> ${booking.dates}</p>
          <p><strong>Reference:</strong> <span style="color:#f5c842">${booking.ref}</span></p>
        </div>
        <p style="color:rgba(255,255,255,.4);font-size:12px">Payment is held securely and released after both parties rate each other post-event.</p>
      </div>
    `,
  })
}

async function sendVerificationResult(email, approved, reason) {
  await transporter.sendMail({
    from: `"CrewNG" <${process.env.SMTP_USER}>`,
    to: email,
    subject: approved ? '✅ Your CrewNG profile is now live!' : '⚠️ CrewNG verification update',
    html: `
      <div style="font-family:sans-serif;max-width:500px;margin:auto;background:#0f0f0f;color:#fff;padding:32px;border-radius:16px">
        <h2 style="color:${approved ? '#22c55e' : '#f97316'}">${approved ? '🎉 You are verified!' : 'Verification Issue'}</h2>
        <p style="color:rgba(255,255,255,.7)">${approved
          ? 'Your NIN and face have been verified. Your profile is now live and you can start receiving bookings!'
          : `Your verification could not be completed. Reason: ${reason || 'Please resubmit your documents.'}`}
        </p>
        <a href="${process.env.CLIENT_URL}" style="display:inline-block;background:linear-gradient(135deg,#f5c842,#e6a817);color:#000;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;margin:16px 0">Open CrewNG</a>
      </div>
    `,
  })
}

module.exports = { sendResetEmail, sendBookingConfirmation, sendVerificationResult }
