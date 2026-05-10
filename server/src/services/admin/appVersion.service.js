import prisma from '../../utils/prisma.js';

export async function listAppVersions() {
  return prisma.appVersion.findMany();
}

export async function upsertAppVersion(platform, data) {
  return prisma.appVersion.upsert({
    where: { id: `app-version-${platform}` },
    update: data,
    create: { id: `app-version-${platform}`, platform, ...data },
  });
}

export async function getPublicAppVersion(platform, clientVersion) {
  const record = await prisma.appVersion.findFirst({ where: { platform } });
  if (!record) return { status: 'current', forceUpdate: false };

  const compare = (a, b) => {
    const pa = a.split('.').map(Number);
    const pb = b.split('.').map(Number);
    for (let i = 0; i < 3; i++) {
      if ((pa[i] || 0) < (pb[i] || 0)) return -1;
      if ((pa[i] || 0) > (pb[i] || 0)) return 1;
    }
    return 0;
  };

  if (clientVersion && compare(clientVersion, record.minVersion) < 0) {
    return { status: 'force_update', forceUpdate: true, latestVersion: record.latestVersion, storeUrl: record.storeUrl };
  }
  if (clientVersion && compare(clientVersion, record.latestVersion) < 0) {
    return { status: 'optional_update', forceUpdate: false, latestVersion: record.latestVersion, storeUrl: record.storeUrl };
  }
  return { status: 'current', forceUpdate: false, latestVersion: record.latestVersion };
}

export async function listBrandingAssets() {
  return prisma.brandingAsset.findMany();
}

export async function upsertBrandingAsset(key, url) {
  return prisma.brandingAsset.upsert({
    where: { key },
    update: { url },
    create: { key, url },
  });
}
