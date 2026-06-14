import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { subject, text, to } = await request.json();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "sitecreation235@gmail.com",
        pass: "vusx adkc nxlh ooky",
      },
    });

    const mailOptions = {
      from: "sitecreation235@gmail.com",
      to: to || "sitecreation235@gmail.com",
      subject,
      text,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Erreur d'envoi d'email:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email", details: error.message },
      { status: 500 }
    );
  }
}
