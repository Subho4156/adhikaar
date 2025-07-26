import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserRole } from "@/app/generated/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const profile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      include: {
        advocateProfile: true,
        vkycDocuments: true,
        reports: {
          select: {
            id: true,
            title: true,
            category: true,
            created_at: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    const data = await req.json();

    console.log("User profile update request for user:", decoded.userId);
    console.log("Update data received:", JSON.stringify(data, null, 2));

    const fieldMapping: { [key: string]: string } = {
      firstName: "first_name",
      lastName: "last_name",
      email: "email",
      phone: "phone",
      address: "address",
      role: "role",
      password: "password",
    };

    const mappedData: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const mappedKey = fieldMapping[key] || key;
      mappedData[mappedKey] = data[key];
    });

    console.log(
      "Mapped data for database:",
      JSON.stringify(mappedData, null, 2)
    );

    if (mappedData.role) {
      const roleMapping: { [key: string]: string } = {
        user: "REGULAR_USER",
        regular_user: "REGULAR_USER",
        barrister: "BARRISTER",
        lawyer: "LAWYER",
        government_official: "GOVERNMENT_OFFICIAL",
      };

      if (roleMapping[mappedData.role.toLowerCase()]) {
        mappedData.role = roleMapping[mappedData.role.toLowerCase()];
      }

      if (!Object.values(UserRole).includes(mappedData.role as UserRole)) {
        console.log("Error: Invalid role provided:", mappedData.role);
        return NextResponse.json(
          { error: `Invalid role provided: ${mappedData.role}` },
          { status: 400 }
        );
      }
    }

    const existingProfile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      include: { advocateProfile: true },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const significantFields = [
      "first_name",
      "last_name",
      "phone",
      "address",
      "role",
    ] as const;
    const isSignificantUpdate = significantFields.some((field) => {
      const fieldKey = field as keyof typeof existingProfile;
      return (
        mappedData[field] !== undefined &&
        mappedData[field] !== existingProfile[fieldKey]
      );
    });

    console.log("Is significant update:", isSignificantUpdate);

    const updateData = { ...mappedData };
    if (mappedData.password) {
      updateData.password = await bcrypt.hash(
        mappedData.password as string,
        12
      );
    }

    if (isSignificantUpdate) {
      updateData.vkyc_completed = false;
      updateData.vkyc_completed_at = null;
    }

    const professionalRoles = ["BARRISTER", "LAWYER", "GOVERNMENT_OFFICIAL"];
    const isChangingToProfessional =
      mappedData.role &&
      professionalRoles.includes(mappedData.role as string) &&
      !professionalRoles.includes(existingProfile.role);
    const isChangingFromProfessional =
      professionalRoles.includes(existingProfile.role) &&
      mappedData.role &&
      !professionalRoles.includes(mappedData.role as string);

    await prisma.profile.update({
      where: { id: decoded.userId },
      data: {
        ...updateData,
        updated_at: new Date(),
      },
    });

    if (isSignificantUpdate && existingProfile.vkyc_completed) {
      console.log("Clearing VKYC documents due to significant profile update");
      await prisma.vkycDocument.deleteMany({
        where: { user_id: decoded.userId },
      });
    }

    if (isChangingToProfessional && !existingProfile.advocateProfile) {
      await prisma.advocateProfile.create({
        data: {
          user_id: decoded.userId,
          specialization: [],
          experience: 0,
          hourly_rate: 0,
          certifications: [],
          languages: [],
          is_verified: false,
          is_available: true,
          total_consultations: 0,
          total_earnings: 0,
          rating: 0,
        },
      });
    } else if (isChangingFromProfessional && existingProfile.advocateProfile) {
      await prisma.advocateProfile.delete({
        where: { user_id: decoded.userId },
      });
    }

    const updatedProfile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
      include: {
        advocateProfile: true,
        vkycDocuments: true,
      },
    });

    const response = {
      success: true,
      profile: updatedProfile,
      message: isSignificantUpdate
        ? "Profile updated successfully. VKYC verification is required due to significant changes."
        : "Profile updated successfully.",
      vkyc_reset: isSignificantUpdate,
      requires_vkyc: isSignificantUpdate,
    };

    console.log("User profile update successful:", response.message);
    return NextResponse.json(response);
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      {
        error: "Failed to update profile",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    const existingProfile = await prisma.profile.findUnique({
      where: { id: decoded.userId },
    });

    if (!existingProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    await prisma.payment.deleteMany({
      where: {
        OR: [{ client_id: decoded.userId }, { advocate_id: decoded.userId }],
      },
    });

    await prisma.consultationRequest.deleteMany({
      where: {
        OR: [{ client_id: decoded.userId }, { advocate_id: decoded.userId }],
      },
    });

    await prisma.accessGrant.deleteMany({
      where: { user_id: decoded.userId },
    });

    await prisma.chatMessage.deleteMany({
      where: {
        OR: [{ sender_id: decoded.userId }, { receiver_id: decoded.userId }],
      },
    });

    await prisma.videoCall.deleteMany({
      where: {
        OR: [{ client_id: decoded.userId }, { advocate_id: decoded.userId }],
      },
    });

    await prisma.monthlyEarnings.deleteMany({
      where: { advocate_id: decoded.userId },
    });

    await prisma.profile.delete({
      where: { id: decoded.userId },
    });

    const response = NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });

    response.cookies.delete("auth-token");

    return response;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      {
        error: "Failed to delete account",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
