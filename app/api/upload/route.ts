// app/api/upload/route.ts

import { NextResponse } from "next/server";

import { writeFile } from "fs/promises";

import path from "path";

import { v4 as uuid } from "uuid";

export async function POST(req: Request) {
    try {
        const data = await req.formData();

        const file = data.get("file") as File;

        if (!file) {
            return NextResponse.json(
                {
                    error: "No file uploaded",
                },
                {
                    status: 400,
                }
            );
        }

        const bytes = await file.arrayBuffer();

        const buffer = Buffer.from(bytes);

        const extension =
            file.name.split(".").pop();

        const fileName = `${uuid()}.${extension}`;

        const uploadDir = path.join(
            process.cwd(),
            "public/uploads"
        );

        const filePath = path.join(
            uploadDir,
            fileName
        );

        await writeFile(filePath, buffer);

        const fileUrl = `/uploads/${fileName}`;

        return NextResponse.json({
            success: true,
            url: fileUrl,
        });
    } catch (error) {
        console.error(error);

        return NextResponse.json(
            {
                error: "Upload failed",
            },
            {
                status: 500,
            }
        );
    }
}