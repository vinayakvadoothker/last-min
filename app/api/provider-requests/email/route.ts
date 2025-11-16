import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { requestData } = await request.json()

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-row { margin: 15px 0; padding: 15px; background: white; border-radius: 5px; }
            .label { font-weight: bold; color: #667eea; }
            .value { margin-top: 5px; }
            .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Provider Request</h1>
              <p>A new provider has requested to join the platform</p>
            </div>
            <div class="content">
              <div class="info-row">
                <div class="label">Applicant Email:</div>
                <div class="value">${requestData.email}</div>
              </div>
              <div class="info-row">
                <div class="label">Full Name:</div>
                <div class="value">${requestData.fullName}</div>
              </div>
              <div class="info-row">
                <div class="label">Organization Name:</div>
                <div class="value">${requestData.organizationName}</div>
              </div>
              <div class="info-row">
                <div class="label">Organization Type:</div>
                <div class="value">${requestData.organizationType}</div>
              </div>
              <div class="info-row">
                <div class="label">Business Address:</div>
                <div class="value">${requestData.businessAddress}, ${requestData.city}, ${requestData.state || ''} ${requestData.country}</div>
              </div>
              ${requestData.phone ? `
              <div class="info-row">
                <div class="label">Phone:</div>
                <div class="value">${requestData.phone}</div>
              </div>
              ` : ''}
              ${requestData.website ? `
              <div class="info-row">
                <div class="label">Website:</div>
                <div class="value"><a href="${requestData.website}">${requestData.website}</a></div>
              </div>
              ` : ''}
              <div class="info-row">
                <div class="label">Why they should be onboarded:</div>
                <div class="value">${requestData.reason.replace(/\n/g, '<br>')}</div>
              </div>
              <p style="margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/provider-requests" class="button">
                  Review Request in Admin Dashboard
                </a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    await resend.emails.send({
      from: 'Last-Min <onboarding@resend.dev>', // Update with your verified domain
      to: 'vinvadoothker@gmail.com',
      subject: `New Provider Request: ${requestData.organizationName}`,
      html: emailHtml,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

