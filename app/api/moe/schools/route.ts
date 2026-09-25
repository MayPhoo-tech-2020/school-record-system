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
    const moeSchools = await prisma.mOE.findMany({
      orderBy: {
        id: "asc",
      },
      include: {
        schoolType: true,
        allowedSchoolLevel: true,
        classToBeTaught: true,
      },
    });

    const schools = moeSchools.map((school) => ({
      id: school.id,

      schoolName: school.schoolName,
      schoolAddress: school.schoolAddress,
      openingPeriod: school.openingPeriod,

      schoolType: school.schoolType?.schoolType ?? "",

      allowedSchoolLevel:
        school.allowedSchoolLevel?.schoolLevel ?? "",

      classToBeTaught:
        school.classToBeTaught?.classToBeTaught ?? "",
    }));

    return NextResponse.json({
      success: true,
      count: schools.length,
      data: schools,
    });
  } catch (error) {
    console.error(
      "GET /api/moe/schools error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch MOE schools",
      },
      {
        status: 500,
      }
    );
  }
}