import { listProperties } from '../services/property.service.js';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  parsePagination,
} from '../utils/response.js';


// ─── GET /api/v1/public/properties ───────────────────────────────────────────
export async function publicListPropertiesHandler(req, res) {
  try {
    const { location, minPrice, maxPrice, type, schemeId } = req.query;
    const pagination = parsePagination(req.query);

    // Always force status=AVAILABLE for public endpoint
    const filters = {
      status: 'AVAILABLE',
      ...(location ? { location } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(type ? { type } : {}),
      ...(schemeId ? { schemeId } : {}),
    };

    const { items, totalItems, page, pageSize } = await listProperties(filters, pagination);
    return paginatedResponse(res, items, totalItems, page, pageSize, 'Properties fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /api/v1/public/schemes ──────────────────────────────────────────────
export async function publicListSchemesHandler(req, res) {
  try {
    const { page = 1, pageSize = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);

    const where = { isActive: true };

    const [totalItems, schemes] = await Promise.all([
      prisma.scheme.count({ where }),
      prisma.scheme.findMany({
        where,
        skip,
        take,
        orderBy: [{ featuredScheme: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          schemeName: true,
          schemeType: true,
          address: true,
          city: true,
          state: true,
          featuredScheme: true,
          shortDescription: true,
          images: {
            select: { imageUrl: true },
            orderBy: { slot: 'asc' }
          },
          _count: {
            select: {
              properties: {
                where: { status: 'AVAILABLE', deletedAt: null }
              }
            }
          }
        },
      }),
    ]);

    const items = schemes.map((s) => ({
      id: s.id,
      name: s.schemeName,
      type: s.schemeType,
      address: s.address,
      city: s.city,
      state: s.state,
      isFeatured: s.featuredScheme,
      description: s.shortDescription,
      images: s.images.map(img => img.imageUrl),
      thumbnail: s.images.length > 0 ? s.images[0].imageUrl : null,
      availablePropertiesCount: s._count.properties,
    }));

    return paginatedResponse(res, items, totalItems, Number(page), Number(pageSize), 'Schemes fetched successfully');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

import { getPublicAppVersion, listBrandingAssets } from '../services/admin/appVersion.service.js';
import { checkRedisHealth } from '../utils/redis.js';
import prisma from '../utils/prisma.js';
import {
  getPrivacyPolicyHtml,
  getTermsHtml,
  getSupportHtml,
} from '../content/legal-pages.js';



// ─── GET /api/v1/public/app-version ──────────────────────────────────────────
export async function publicAppVersionHandler(req, res) {
  try {
    const { platform, version } = req.query;
    if (!platform) return errorResponse(res, 'platform query param is required', 400);
    const result = await getPublicAppVersion(platform, version);
    return successResponse(res, result, 'App version info');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /api/v1/public/branding ─────────────────────────────────────────────
export async function publicBrandingHandler(req, res) {
  try {
    const assets = await listBrandingAssets();
    const result = Object.fromEntries(assets.map((a) => [a.key, a.url]));
    return successResponse(res, result, 'Branding assets');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── POST /api/v1/public/contact ─────────────────────────────────────────────
export async function publicContactHandler(req, res) {
  try {
    const { name, email, phone, message } = req.body;
    if (!name || !email || !message) {
      return errorResponse(res, 'name, email, and message are required', 400);
    }
    const inquiry = await prisma.contactInquiry.create({
      data: { name, email, phone: phone || null, message },
    });
    return successResponse(res, { id: inquiry.id }, 'Contact inquiry submitted');
  } catch (err) {
    return errorResponse(res, err.message, err.statusCode || 500);
  }
}

// ─── GET /api/v1/public/privacy | /terms | /support (JSON format) ─────────────
export async function publicPrivacyHandler(req, res) {
  return res.json({
    status: 'success',
    message: 'Privacy Policy fetched successfully',
    data: {
      title: 'Privacy Policy',
      content: getPrivacyPolicyHtml(),
    },
  });
}

export async function publicTermsHandler(req, res) {
  return res.json({
    status: 'success',
    message: 'Terms & Conditions fetched successfully',
    data: {
      title: 'Terms & Conditions',
      content: getTermsHtml(),
    },
  });
}

export async function publicSupportPageHandler(req, res) {
  return res.json({
    status: 'success',
    message: 'Help & Support fetched successfully',
    data: {
      title: 'Help & Support',
      content: getSupportHtml(),
    },
  });
}

// ─── GET /api/v1/public/help-center ──────────────────────────────────────────
export async function publicHelpCenterHandler(req, res) {
  return successResponse(res, {
    heading: "How can we help you?",
    subHeading: "Our team is available to assist you with any queries.",
    cards: [
      {
        id: "ticket",
        title: "Raise a Ticket",
        description: "Report an issue or request help",
        type: "app_route",
        action: "/support/tickets"
      },
      {
        id: "whatsapp",
        title: "WhatsApp Support",
        description: "Chat with our support team",
        type: "whatsapp",
        action: "+919876543210"
      },
      {
        id: "call",
        title: "Call Support",
        description: "Talk to our representative",
        type: "phone",
        action: "+919876543210"
      },
      {
        id: "email",
        title: "Email Support",
        description: "Send us an email anytime",
        type: "email",
        action: "support@investorsworldrealty.com"
      }
    ],
    footer: {
      time: "Available 10:00 AM - 06:00 PM",
      days: "Monday to Saturday"
    }
  }, 'Help center info');
}

// ─── GET /api/v1/public/health ───────────────────────────────────────────────
export async function publicHealthHandler(req, res) {
  try {
    // DB check
    let dbStatus = 'ok';
    try { await prisma.$queryRaw`SELECT 1`; } catch { dbStatus = 'error'; }

    // Redis check
    const redisResult = await checkRedisHealth();

    return successResponse(res, {
      server: 'ok',
      database: dbStatus,
      redis: redisResult.status,
    }, 'Health check');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
}
