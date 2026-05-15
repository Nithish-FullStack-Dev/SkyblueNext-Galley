// app/api/vendors/send-order/route.ts

import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const transporter = nodemailer.createTransport({
            host: "smtp.zoho.in",

            port: 465,

            secure: true,

            auth: {
                user: process.env.ZOHO_EMAIL,

                pass: process.env.ZOHO_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: process.env.ZOHO_EMAIL,

            to: body.email,

            subject: `Skyblue Galley Catering Order - ${body.flightNumber}`,

            html: `
<div style="
  font-family: Arial, sans-serif;
  padding: 24px;
  background: #f8fafc;
">
  
  <div style="
    max-width: 700px;
    margin: auto;
    background: white;
    border-radius: 14px;
    padding: 32px;
    border: 1px solid #e2e8f0;
  ">

    <h2 style="
      margin: 0 0 24px;
      color: #1868A5;
      font-size: 28px;
    ">
      SkyBlue Galley
    </h2>

    <div style="
      font-size: 15px;
      line-height: 1.8;
      color: #1e293b;
    ">
      ${body.message}
    </div>

    <div style="
      margin-top: 32px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 14px;
      color: #475569;
    ">
      Please find attached vendor catering PDF.
    </div>

  </div>
</div>
`,

            attachments: [
                {
                    filename:
                        body.filename ||
                        `${body.vendorName}-order.pdf`,

                    content: Buffer.from(
                        body.pdfBuffer,
                        "base64",
                    ),

                    contentType: "application/pdf",
                },
            ],
        });

        return NextResponse.json({
            success: true,
        });
    } catch (error) {
        console.log(error);

        return NextResponse.json(
            {
                error: "Failed to send vendor mail",
            },
            {
                status: 500,
            },
        );
    }
}