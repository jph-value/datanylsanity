import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

type WaitlistRecord = {
  email: string;
  company?: string;
  createdAt: string;
  ip?: string | null;
  userAgent?: string | null;
};

function isValidEmail(email: string): boolean {
  return /.+@.+\..+/.test(email);
}

function getDataFilePath(): string {
  const projectRoot = process.cwd();
  return path.join(projectRoot, "data", "waitlist.json");
}

async function ensureDataFile(): Promise<void> {
  const filePath = getDataFilePath();
  const dirPath = path.dirname(filePath);
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch {}
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify([]), "utf8");
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, company } = (await request.json()) as {
      email?: string;
      company?: string;
    };

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    await ensureDataFile();
    const filePath = getDataFilePath();

    const existingRaw = await fs.readFile(filePath, "utf8");
    let records: WaitlistRecord[] = [];
    try {
      records = JSON.parse(existingRaw) as WaitlistRecord[];
      if (!Array.isArray(records)) records = [];
    } catch {
      records = [];
    }

    const newRecord: WaitlistRecord = {
      email: String(email).trim().toLowerCase(),
      company: company ? String(company).trim() : undefined,
      createdAt: new Date().toISOString(),
      ip: request.ip ?? request.headers.get("x-forwarded-for"),
      userAgent: request.headers.get("user-agent"),
    };

    records.push(newRecord);
    await fs.writeFile(filePath, JSON.stringify(records, null, 2), "utf8");

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}


