import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { ref, get } from "firebase/database";
import { db } from "@/lib/firebase-server";

export async function POST(request: NextRequest) {
  try {
    const { subject, html, text, to } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sitecreation235@gmail.com",
        pass: "vusx adkc nxlh ooky",
      },
    });

    const defaultHtml = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: linear-gradient(145deg, #ffffff 0%, #f1f5f9 100%); border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; font-size: 28px; font-weight: 700; margin-bottom: 10px; }
          .header p { color: rgba(255,255,255,0.9); font-size: 16px; }
          .content { padding: 40px 30px; }
          .content h2 { color: #1e293b; font-size: 22px; margin-bottom: 20px; font-weight: 600; }
          .content p { color: #475569; font-size: 16px; line-height: 1.8; margin-bottom: 25px; }
          .devices-list { background: #f8fafc; border-radius: 16px; padding: 20px; margin-bottom: 30px; }
          .device-item { display: flex; align-items: center; gap: 15px; padding: 12px 15px; background: white; border-radius: 12px; margin-bottom: 10px; border-left: 4px solid #3b82f6; }
          .device-item:last-child { margin-bottom: 0; }
          .device-icon { width: 40px; height: 40px; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; }
          .device-details { flex: 1; }
          .device-name { font-weight: 600; color: #1e293b; font-size: 15px; }
          .device-info { color: #64748b; font-size: 13px; margin-top: 3px; }
          .cta { display: block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-align: center; padding: 16px; border-radius: 14px; text-decoration: none; font-weight: 600; font-size: 16px; margin-bottom: 25px; }
          .cta:hover { opacity: 0.95; }
          .footer { text-align: center; padding: 25px 30px; background: #f8fafc; color: #94a3b8; font-size: 13px; }
          .footer a { color: #3b82f6; text-decoration: none; }
          .power-badge { display: inline-flex; align-items: center; gap: 8px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 8px 16px; border-radius: 50px; font-weight: 600; font-size: 16px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⚡ Smart Energy</h1>
            <p>Gestion intelligente de l'énergie</p>
          </div>
          <div class="content">
            ${html || `<h2>Bonjour,</h2><p>${text || subject}</p>`}
          </div>
          <div class="footer">
            <p>© 2026 Smart Energy. Tous droits réservés.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Fetch all users from Firebase
    const usersRef = ref(db, "users");
    const snapshot = await get(usersRef);
    let recipients: string[] = [];
    
    if (snapshot.exists()) {
      const usersData = snapshot.val();
      recipients = Object.values(usersData).map((user: any) => user.email).filter(Boolean);
    }
    
    // Fallback to provided "to" or default if no users found
    if (recipients.length === 0) {
      recipients = to ? [to] : ["sitecreation235@gmail.com"];
    }

    const mailOptions = {
      from: "Smart Energy <sitecreation235@gmail.com>",
      to: recipients,
      subject,
      text,
      html: defaultHtml,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, sentTo: recipients }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur d'envoi d'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email", details: error.message },
      { status: 500 }
    );
  }
}
