/**
 * Unit tests for notification payload construction.
 * Tests FCM payload structure, data serialization, and platform-specific config.
 */

// ─── Pure logic function (mirrors notification service logic) ─────────────────

function buildNotificationPayload(title, body, type, data = {}) {
  return {
    notification: { title, body },
    data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
    android: { priority: 'high' },
    apns: { payload: { aps: { sound: 'default' } } },
  };
}

// ─── Notification Structure ───────────────────────────────────────────────────

describe('Notification: Payload Structure', () => {
  it('has notification.title and notification.body', () => {
    const payload = buildNotificationPayload('Test Title', 'Test Body', 'INFO');
    expect(payload.notification).toHaveProperty('title', 'Test Title');
    expect(payload.notification).toHaveProperty('body', 'Test Body');
  });

  it('preserves title and body exactly as provided', () => {
    const payload = buildNotificationPayload('KYC Approved!', 'Your KYC has been approved.', 'KYC');
    expect(payload.notification.title).toBe('KYC Approved!');
    expect(payload.notification.body).toBe('Your KYC has been approved.');
  });

  it('handles empty title and body', () => {
    const payload = buildNotificationPayload('', '', 'INFO');
    expect(payload.notification.title).toBe('');
    expect(payload.notification.body).toBe('');
  });

  it('handles special characters in title and body', () => {
    const payload = buildNotificationPayload('₹10,000 credited!', 'Amount: ₹10,000 & more', 'WALLET');
    expect(payload.notification.title).toBe('₹10,000 credited!');
    expect(payload.notification.body).toBe('Amount: ₹10,000 & more');
  });
});

// ─── Data Serialization ───────────────────────────────────────────────────────

describe('Notification: Data Values Are Strings', () => {
  it('converts number values to strings', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', { amount: 5000, count: 3 });
    expect(payload.data.amount).toBe('5000');
    expect(payload.data.count).toBe('3');
  });

  it('converts boolean values to strings', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', { isNew: true, read: false });
    expect(payload.data.isNew).toBe('true');
    expect(payload.data.read).toBe('false');
  });

  it('keeps string values as strings', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', { id: 'uuid-123', type: 'KYC' });
    expect(payload.data.id).toBe('uuid-123');
    expect(payload.data.type).toBe('KYC');
  });

  it('handles empty data object', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', {});
    expect(payload.data).toEqual({});
  });

  it('handles no data argument (defaults to empty)', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO');
    expect(payload.data).toEqual({});
  });

  it('all data values are typeof string', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', {
      num: 42,
      bool: true,
      str: 'hello',
      zero: 0,
    });
    for (const value of Object.values(payload.data)) {
      expect(typeof value).toBe('string');
    }
  });
});

// ─── Android Configuration ────────────────────────────────────────────────────

describe('Notification: Android Config', () => {
  it('has android.priority set to "high"', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO');
    expect(payload.android).toHaveProperty('priority', 'high');
  });

  it('android priority is always "high" regardless of type', () => {
    const types = ['INFO', 'KYC', 'WALLET', 'BOOKING', 'SUPPORT'];
    for (const type of types) {
      const payload = buildNotificationPayload('Title', 'Body', type);
      expect(payload.android.priority).toBe('high');
    }
  });
});

// ─── APNs Configuration ───────────────────────────────────────────────────────

describe('Notification: APNs Config', () => {
  it('has apns.payload.aps.sound set to "default"', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO');
    expect(payload.apns.payload.aps.sound).toBe('default');
  });

  it('APNs sound is always "default" regardless of type', () => {
    const types = ['INFO', 'KYC', 'WALLET', 'BOOKING', 'SUPPORT'];
    for (const type of types) {
      const payload = buildNotificationPayload('Title', 'Body', type);
      expect(payload.apns.payload.aps.sound).toBe('default');
    }
  });
});

// ─── Full Payload Shape ───────────────────────────────────────────────────────

describe('Notification: Full Payload Shape', () => {
  it('has all required top-level keys', () => {
    const payload = buildNotificationPayload('Title', 'Body', 'INFO', { key: 'value' });
    expect(Object.keys(payload)).toEqual(
      expect.arrayContaining(['notification', 'data', 'android', 'apns']),
    );
  });

  it('matches expected full structure', () => {
    const payload = buildNotificationPayload('New Booking', 'Property booked', 'BOOKING', {
      bookingId: 'bk-001',
      propertyId: 123,
    });

    expect(payload).toEqual({
      notification: { title: 'New Booking', body: 'Property booked' },
      data: { bookingId: 'bk-001', propertyId: '123' },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    });
  });
});
