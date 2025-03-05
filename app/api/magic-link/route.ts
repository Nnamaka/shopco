import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import nodemailer from "nodemailer";

// const prisma = new PrismaClient();
const ADMIN_EMAIL = ["qualityproperty28@gmail.com","nnamaka7@gmail.com"]; // Change this to your admin email
const MAGIC_LINK_EXPIRY = 15 * 60 * 1000; // 15 minutes

const isAdminEmail = (email: string): boolean => ADMIN_EMAIL.includes(email);

// Configure Email Transporter
const transporter = nodemailer.createTransport({
  service: "yahoo",
  auth: {
    user: process.env.EMAIL_USER, // Set this in your .env
    pass: process.env.EMAIL_PASS, // Set this in your .env
  },
});

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!isAdminEmail(email)) {

    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY);

  await prisma.magicLink.deleteMany({
    where: { email },
  });

  const savedLink = await prisma.magicLink.create({
    data: { email, token, expiresAt },
  });


  // Email the magic link
  const magicLink = `${process.env.NEXT_PUBLIC_APP_URL}/admin/verify?token=${savedLink.token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your Magic Link",
    text: `Click here to log in: ${magicLink}`,
    html: `<p>Click <a href="${magicLink}">here</a> to log in.</p>`,
  });

  return NextResponse.json({ message: "Magic link sent!" });
}
