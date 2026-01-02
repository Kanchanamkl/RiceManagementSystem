import { NextResponse } from 'next/server';

export function successResponse(data: any, message?: string) {
  return NextResponse.json({
    success: true,
    data,
    ...(message && { message }),
  });
}

export function errorResponse(message: string, statusCode: number = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...(details && { details }),
      },
    },
    { status: statusCode }
  );
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
      },
    },
    { status: 401 }
  );
}

export function notFoundResponse(message: string = 'Not found') {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
      },
    },
    { status: 404 }
  );
}

export function forbiddenResponse(message: string = 'Forbidden') {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
      },
    },
    { status: 403 }
  );
}

export function validationErrorResponse(errors: Record<string, string[]>) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message: 'Validation failed',
        details: errors,
      },
    },
    { status: 422 }
  );
}
