import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

const PAYMENT_LABELS: Record<string, string> = {
  cash:     'Cash',
  transfer: 'Bank Transfer',
  edinar:   'E-Dinar',
}

function buildEmailHtml(data: {
  name: string
  email: string
  serviceLabel: string
  date: string
  time: string
  people: number
  adults?: number
  children?: number
  under5?: number
  hours: number
  payment: string
  total: number
  discount: number
  id: string
  adminNote?: string
}) {
  const discountedTotal = Math.round(data.total * (1 - data.discount / 100))

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Booking Confirmed – BAHRI TRIP</title>
</head>
<body style="margin:0;padding:0;background:#faf8f3;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a4c 0%,#0d2b3e 100%);border-radius:24px 24px 0 0;padding:40px 40px 32px;text-align:center;">
            <h1 style="margin:0;color:#fff;font-size:32px;font-weight:900;letter-spacing:3px;">BAHRI <span style="color:#7dd3d0;">TRIP</span></h1>
            <p style="margin:8px 0 0;color:rgba(255,255,255,.6);font-size:13px;letter-spacing:4px;text-transform:uppercase;">
              Unforgettable Sea Experiences · Tunisia
            </p>
          </td>
        </tr>

        <!-- Success -->
        <tr>
          <td style="background:#fff;padding:40px 40px 32px;text-align:center;">
            <div style="display:inline-block;background:#ecfdf5;border:2px solid #6ee7b7;border-radius:50%;width:72px;height:72px;line-height:72px;font-size:36px;">✓</div>
            <h2 style="margin:20px 0 8px;color:#062B37;font-size:28px;font-weight:900;">Booking Confirmed!</h2>
            <p style="margin:0;color:#64748b;font-size:16px;">
              Hi <strong style="color:#06b6d4;">${data.name}</strong>, your reservation is all set.<br/>
              We look forward to welcoming you aboard.
            </p>
          </td>
        </tr>

        <!-- Details table -->
        <tr>
          <td style="background:#fff;padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:#f8fafc;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
              <tr>
                <td style="padding:20px 24px;border-bottom:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:11px;font-weight:700;color:#94a3b8;letter-spacing:3px;text-transform:uppercase;">
                    Reservation Details
                  </p>
                </td>
              </tr>
              ${[
                ['Reservation ID', data.id],
                ['Service',        data.serviceLabel],
                ['Date',           data.date],
                ['Time',           data.time],
                ['Guests',         String(data.people)],
                ...(data.hours > 1 ? [['Duration', `${data.hours} hours`]] : []),
                ...(data.adults > 0 ? [['Adults', `${data.adults} × 100 DT = ${100 * data.adults} DT`]] : []),
                ...(data.children > 0 ? [['Children (5-11)', `${data.children} × 70 DT = ${data.children * 70} DT`]] : []),
                ...(data.under5 > 0 ? [['Under 5', `${data.under5} × Free = 0 DT`]] : []),
                ['Payment',        PAYMENT_LABELS[data.payment] ?? data.payment],
              ].map(([label, value]) => `
              <tr>
                <td style="padding:14px 24px;border-bottom:1px solid #f1f5f9;">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="color:#64748b;font-size:14px;">${label}</td>
                    <td style="color:#0f172a;font-size:14px;font-weight:700;text-align:right;">${value}</td>
                  </tr></table>
                </td>
              </tr>`).join('')}

              <!-- Total row -->
              <tr>
                 <td style="padding:20px 24px;background:#1e3a4c;border-radius:0 0 16px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0"><tr>
                    <td style="color:rgba(255,255,255,.7);font-size:14px;">Total Amount</td>
                    <td style="text-align:right;">
                      ${data.discount > 0
                        ? `<span style="color:rgba(255,255,255,.4);font-size:13px;text-decoration:line-through;margin-right:8px;">${data.total} DT</span>`
                        : ''}
                      <span style="color:#7dd3d0;font-size:26px;font-weight:900;">${discountedTotal} DT</span>
                      ${data.discount > 0
                        ? `<span style="background:#2d8a9e;color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;margin-left:6px;">-${data.discount}%</span>`
                        : ''}
                    </td>
                  </tr></table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- What's next -->
        <tr>
          <td style="background:#fff;padding:0 40px 40px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,rgba(45,138,158,.08),rgba(30,95,116,.08));border:1px solid rgba(45,138,158,.2);border-radius:16px;padding:24px;">
              <tr><td>
                <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#2d8a9e;letter-spacing:2px;text-transform:uppercase;">
                  What happens next?
                </p>
                <p style="margin:0;color:#334155;font-size:14px;line-height:1.7;">
                  Our team will contact you shortly to finalise the details of your experience.
                  If you have any questions, reply to this email or call us directly.
                </p>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Message from BAHRI TRIP team (only shown if admin wrote one) -->
        ${data.adminNote ? `
        <tr>
          <td style="background:#fff;padding:0 40px 32px;">
            <table width="100%" cellpadding="0" cellspacing="0"
              style="background:linear-gradient(135deg,#1e3a4c,#0d2b3e);border-radius:16px;padding:28px;">
              <tr><td>
                <p style="margin:0 0 10px;font-size:11px;font-weight:700;color:rgba(255,255,255,.5);letter-spacing:3px;text-transform:uppercase;">
                   Message from BAHRI TRIP
                </p>
                <p style="margin:0;color:#ffffff;font-size:15px;line-height:1.8;">
                  ${data.adminNote}
                </p>
              </td></tr>
            </table>
          </td>
        </tr>` : ''}

        <!-- Footer -->
        <tr>
          <td style="background:#1e3a4c;border-radius:0 0 24px 24px;padding:32px 40px;text-align:center;">
             <p style="margin:0 0 4px;color:#fff;font-size:18px;font-weight:900;">
               BAHRI <span style="color:#7dd3d0;">TRIP</span>
             </p>
             <p style="margin:0;color:rgba(255,255,255,.4);font-size:12px;">
               Unforgettable Sea Experiences · Tunisia
             </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, serviceLabel, date, time, people, hours, payment, total, discount, id, adminNote } = body

    if (!email || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"BAHRI TRIP" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `✅ Booking Confirmed – ${serviceLabel} on ${date}`,
      html: buildEmailHtml({ name, email, serviceLabel, date, time, people, hours, payment, total, discount, id, adminNote }),
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('Email error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}