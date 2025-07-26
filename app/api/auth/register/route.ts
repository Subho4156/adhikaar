import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '@/lib/prisma';
import { UserRole, KycType } from '@/app/generated/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, password, firstName, lastName, phone, role } = await req.json();

        if (!email || !password || !firstName || !lastName) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        let userRole: UserRole = UserRole.REGULAR_USER; 

        if (role) {

            const roleMapping: { [key: string]: UserRole } = {
                'regular_user': UserRole.REGULAR_USER,
                'barrister': UserRole.BARRISTER,
                'lawyer': UserRole.LAWYER,
                'government_official': UserRole.GOVERNMENT_OFFICIAL
            };

            const mappedRole = roleMapping[role.toLowerCase()];
            if (mappedRole) {
                userRole = mappedRole;
            } else if (Object.values(UserRole).includes(role as UserRole)) {
                userRole = role as UserRole;
            }
        }

        const professionalRoles: UserRole[] = [UserRole.BARRISTER, UserRole.LAWYER, UserRole.GOVERNMENT_OFFICIAL];
        const isProfessional = professionalRoles.includes(userRole);
        const kycType = isProfessional ? KycType.PROFESSIONAL : KycType.REGULAR;
        const canUploadReports = isProfessional;

        const existingUser = await prisma.profile.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User already exists' },
                { status: 400 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.profile.create({
            data: {
                email,
                password: hashedPassword,
                first_name: firstName,
                last_name: lastName,
                phone,
                role: userRole,
                kyc_type: kycType,
                can_upload_reports: canUploadReports,
                vkyc_completed: false
            }
        });

        if (isProfessional) {
            await prisma.advocateProfile.create({
                data: {
                    user_id: user.id,
                    specialization: [],
                    experience: 0,
                    hourly_rate: 0,
                    certifications: [],
                    languages: [],
                    is_verified: false,
                    is_available: true,
                    total_consultations: 0,
                    total_earnings: 0,
                    rating: 0
                }
            });
        }


        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET not available during token creation');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const token = jwt.sign(
            {
                userId: user.id,
                email: user.email,
                role: user.role
            },
            jwtSecret,
            { expiresIn: '7d' }
        );

        const session = {
            user: {
                id: user.id,
                email: user.email,
                name: `${firstName} ${lastName}`,
                role: user.role,
                kyc_type: user.kyc_type,
                can_upload_reports: user.can_upload_reports,
                is_professional: isProfessional,
                vkyc_completed: false
            }
        };

        const response = NextResponse.json({
            success: true,
            session,
            message: 'Registration successful'
        });

        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 24 * 7,
            path: '/'
        });

        return response;

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}