import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function GET() {
  try {
    const institutions = await prisma.institution.findMany({
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      count: institutions.length,
      data: institutions,
    });
  } catch (error) {
    console.error("GET /api/institutions error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch institutions",
      },
      { status: 500 }
    );
  }
}