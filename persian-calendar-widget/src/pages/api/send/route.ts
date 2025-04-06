import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend("re_QMVb7kNm_2yhDixAwpbP4k1ECrZZPAzYM");

export async function POST(req: Request) {
  const { message, name, email } = await req.json();

  const text = `
📝 بازخورد جدید:

${message}

👤 فرستنده: ${name || "نامشخص"}
📧 ایمیل: ${email || "نداده"}
`;

  await resend.emails.send({
    from: "calendar@truthofmatthew.com",
    to: "truthofmatthew@gmail.com",
    subject: "بازخورد جدید از فرم",
    text,
  });

  return NextResponse.json({ success: true });
}
