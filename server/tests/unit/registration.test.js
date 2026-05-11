/**
 * Unit tests for registration logic.
 * Tests User ID format, mandatory field validation, uniqueness checks,
 * and placement validation.
 */

// ─── Pure logic functions (mirrors registration.service.js) ───────────────────

const USER_ID_PATTERN = /^IW\d{6}$/;

function generateUserIdFromNumber(num) {
  return `IW${String(num).padStart(6, '0')}`;
}

function validateMandatoryFields(data) {
  const required = ['name', 'phone', 'email', 'address', 'panNumber', 'packageId', 'sponsorId', 'placement', 'password'];
  const missing = [];

  for (const field of required) {
    if (!data[field]) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }

  return true;
}

function validatePlacement(placement) {
  if (!['LEFT', 'RIGHT'].includes(placement)) {
    throw new Error('placement must be LEFT or RIGHT');
  }
  return true;
}

function checkPhoneUniqueness(phone, existingPhones) {
  if (existingPhones.includes(phone)) {
    throw new Error('Phone number is already registered');
  }
  return true;
}

function checkEmailUniqueness(email, existingEmails) {
  if (existingEmails.includes(email)) {
    throw new Error('Email address is already registered');
  }
  return true;
}

// ─── User ID Format ───────────────────────────────────────────────────────────

describe('Registration: User ID Format', () => {
  it('matches /^IW\\d{6}$/ pattern', () => {
    const validIds = ['IW100001', 'IW100002', 'IW999999', 'IW100100', 'IW500000'];
    for (const id of validIds) {
      expect(id).toMatch(USER_ID_PATTERN);
    }
  });

  it('rejects IDs without IW prefix', () => {
    const invalidIds = ['AB100001', '100001', 'iw100001', 'XY999999'];
    for (const id of invalidIds) {
      expect(id).not.toMatch(USER_ID_PATTERN);
    }
  });

  it('rejects IDs with wrong digit count', () => {
    const invalidIds = ['IW10001', 'IW1000001', 'IW12345', 'IW1234567'];
    for (const id of invalidIds) {
      expect(id).not.toMatch(USER_ID_PATTERN);
    }
  });

  it('rejects IDs with non-numeric suffix', () => {
    const invalidIds = ['IW10000a', 'IWabcdef', 'IW12345!', 'IW 10001'];
    for (const id of invalidIds) {
      expect(id).not.toMatch(USER_ID_PATTERN);
    }
  });

  it('generates sequential IDs correctly', () => {
    expect(generateUserIdFromNumber(100001)).toBe('IW100001');
    expect(generateUserIdFromNumber(100002)).toBe('IW100002');
    expect(generateUserIdFromNumber(999999)).toBe('IW999999');
    expect(generateUserIdFromNumber(1)).toBe('IW000001');
  });

  it('generated IDs always match the pattern', () => {
    for (let i = 100001; i <= 100050; i++) {
      const id = generateUserIdFromNumber(i);
      expect(id).toMatch(USER_ID_PATTERN);
    }
  });
});

// ─── Mandatory Field Validation ───────────────────────────────────────────────

describe('Registration: Mandatory Field Validation', () => {
  const validData = {
    name: 'John Doe',
    phone: '9876543210',
    email: 'john@example.com',
    address: '123 Main St',
    panNumber: 'ABCDE1234F',
    packageId: 'pkg-uuid-1',
    sponsorId: 'IW100001',
    placement: 'LEFT',
    password: 'Admin@123',
  };

  it('accepts complete valid data', () => {
    expect(validateMandatoryFields(validData)).toBe(true);
  });

  it('throws error when name is missing', () => {
    const data = { ...validData, name: '' };
    expect(() => validateMandatoryFields(data)).toThrow('Missing required fields');
    expect(() => validateMandatoryFields(data)).toThrow('name');
  });

  it('throws error when phone is missing', () => {
    const data = { ...validData, phone: '' };
    expect(() => validateMandatoryFields(data)).toThrow('phone');
  });

  it('throws error when email is missing', () => {
    const data = { ...validData, email: '' };
    expect(() => validateMandatoryFields(data)).toThrow('email');
  });

  it('throws error when address is missing', () => {
    const data = { ...validData, address: '' };
    expect(() => validateMandatoryFields(data)).toThrow('address');
  });

  it('throws error when panNumber is missing', () => {
    const data = { ...validData, panNumber: '' };
    expect(() => validateMandatoryFields(data)).toThrow('panNumber');
  });

  it('throws error when packageId is missing', () => {
    const data = { ...validData, packageId: '' };
    expect(() => validateMandatoryFields(data)).toThrow('packageId');
  });

  it('throws error when sponsorId is missing', () => {
    const data = { ...validData, sponsorId: '' };
    expect(() => validateMandatoryFields(data)).toThrow('sponsorId');
  });

  it('throws error when placement is missing', () => {
    const data = { ...validData, placement: '' };
    expect(() => validateMandatoryFields(data)).toThrow('placement');
  });

  it('throws error when password is missing', () => {
    const data = { ...validData, password: '' };
    expect(() => validateMandatoryFields(data)).toThrow('password');
  });

  it('lists all missing fields in error message', () => {
    const data = { name: '', phone: '', email: 'test@test.com', address: '123', panNumber: 'PAN', packageId: 'pkg', sponsorId: 'IW100001', placement: 'LEFT', password: 'pass' };
    try {
      validateMandatoryFields(data);
    } catch (err) {
      expect(err.message).toContain('name');
      expect(err.message).toContain('phone');
    }
  });

  it('null values are treated as missing', () => {
    const data = { ...validData, name: null, phone: null };
    expect(() => validateMandatoryFields(data)).toThrow('Missing required fields');
  });
});

// ─── Phone/Email Uniqueness Check ─────────────────────────────────────────────

describe('Registration: Phone/Email Uniqueness', () => {
  const existingPhones = ['9876543210', '9123456789', '8001234567'];
  const existingEmails = ['john@example.com', 'jane@test.com', 'admin@iwr.com'];

  it('accepts unique phone number', () => {
    expect(checkPhoneUniqueness('7777777777', existingPhones)).toBe(true);
  });

  it('rejects duplicate phone number', () => {
    expect(() => checkPhoneUniqueness('9876543210', existingPhones)).toThrow(
      'Phone number is already registered',
    );
  });

  it('accepts unique email', () => {
    expect(checkEmailUniqueness('new@example.com', existingEmails)).toBe(true);
  });

  it('rejects duplicate email', () => {
    expect(() => checkEmailUniqueness('john@example.com', existingEmails)).toThrow(
      'Email address is already registered',
    );
  });

  it('phone check is case-sensitive (numbers)', () => {
    expect(checkPhoneUniqueness('9876543211', existingPhones)).toBe(true);
  });

  it('email check is exact match', () => {
    // The service uses findUnique which is exact match
    expect(checkEmailUniqueness('John@example.com', existingEmails)).toBe(true);
  });
});

// ─── Placement Validation ─────────────────────────────────────────────────────

describe('Registration: Placement Validation', () => {
  it('accepts LEFT placement', () => {
    expect(validatePlacement('LEFT')).toBe(true);
  });

  it('accepts RIGHT placement', () => {
    expect(validatePlacement('RIGHT')).toBe(true);
  });

  it('rejects lowercase "left"', () => {
    expect(() => validatePlacement('left')).toThrow('placement must be LEFT or RIGHT');
  });

  it('rejects lowercase "right"', () => {
    expect(() => validatePlacement('right')).toThrow('placement must be LEFT or RIGHT');
  });

  it('rejects empty string', () => {
    expect(() => validatePlacement('')).toThrow('placement must be LEFT or RIGHT');
  });

  it('rejects arbitrary strings', () => {
    const invalid = ['CENTER', 'UP', 'DOWN', 'MIDDLE', 'left', 'Right', 'L', 'R'];
    for (const placement of invalid) {
      expect(() => validatePlacement(placement)).toThrow('placement must be LEFT or RIGHT');
    }
  });

  it('rejects null/undefined', () => {
    expect(() => validatePlacement(null)).toThrow('placement must be LEFT or RIGHT');
    expect(() => validatePlacement(undefined)).toThrow('placement must be LEFT or RIGHT');
  });
});
