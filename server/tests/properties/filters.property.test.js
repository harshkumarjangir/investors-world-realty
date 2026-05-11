import fc from 'fast-check';

/**
 * Pure logic tests for filter operations.
 * These replicate the filtering logic used in genealogy.service.js and
 * property.service.js without hitting the database.
 */

// ─── Filter logic (mirrors service implementations) ───────────────────────────

function filterTeamMembers(members, filters) {
  const { status, leg, level } = filters;
  let result = [...members];

  if (status) {
    result = result.filter((m) => m.status === status);
  }
  if (leg) {
    const normalizedLeg = leg.toLowerCase();
    result = result.filter((m) => m.legFromRoot === normalizedLeg);
  }
  if (level !== undefined && level !== null && level !== '') {
    const levelNum = parseInt(level, 10);
    result = result.filter((m) => m.depthFromRoot === levelNum);
  }

  return result;
}

function filterProperties(properties, filters) {
  const { location, minPrice, maxPrice, type, status } = filters;
  let result = properties.filter((p) => p.deletedAt === null);

  if (status) {
    result = result.filter((p) => p.status === status);
  } else {
    result = result.filter((p) => p.status === 'AVAILABLE');
  }

  if (type) {
    result = result.filter((p) => p.type === type);
  }

  if (location) {
    const loc = location.toLowerCase();
    result = result.filter(
      (p) =>
        (p.location && p.location.toLowerCase().includes(loc)) ||
        (p.city && p.city.toLowerCase().includes(loc)) ||
        (p.state && p.state.toLowerCase().includes(loc)),
    );
  }

  if (minPrice !== undefined && minPrice !== null) {
    result = result.filter((p) => p.price >= minPrice);
  }
  if (maxPrice !== undefined && maxPrice !== null) {
    result = result.filter((p) => p.price <= maxPrice);
  }

  return result;
}

function filterOutDeleted(records) {
  return records.filter((r) => r.deletedAt === null);
}

function canBookProperty(propertyStatus) {
  return propertyStatus === 'AVAILABLE';
}

// ─── Generators ───────────────────────────────────────────────────────────────

const teamMemberArb = fc.record({
  userId: fc.string({ minLength: 8, maxLength: 8 }),
  name: fc.string({ minLength: 2, maxLength: 30 }),
  status: fc.constantFrom('ACTIVE', 'INACTIVE', 'SUSPENDED'),
  legFromRoot: fc.constantFrom('left', 'right'),
  depthFromRoot: fc.integer({ min: 1, max: 10 }),
});

const propertyArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 3, maxLength: 50 }),
  location: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'),
  city: fc.constantFrom('Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'),
  state: fc.constantFrom('Maharashtra', 'Karnataka', 'Tamil Nadu', 'Delhi'),
  price: fc.double({ min: 100000, max: 100000000, noNaN: true }),
  type: fc.constantFrom('PLOT', 'FLAT', 'VILLA', 'COMMERCIAL'),
  status: fc.constantFrom('AVAILABLE', 'BOOKED', 'SOLD'),
  deletedAt: fc.constantFrom(null, null, null, new Date().toISOString()),
});

const softDeletableRecordArb = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 2, maxLength: 30 }),
  deletedAt: fc.constantFrom(null, null, null, new Date().toISOString()),
});

// ─── Property 7: Team Filter Consistency ──────────────────────────────────────

describe('Feature: investors-world-platform, Property 7: Team Filter Consistency', () => {
  it('all returned members satisfy ALL filter conditions', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArb, { minLength: 1, maxLength: 30 }),
        fc.record({
          status: fc.constantFrom('ACTIVE', 'INACTIVE', 'SUSPENDED', undefined),
          leg: fc.constantFrom('left', 'right', undefined),
          level: fc.constantFrom(1, 2, 3, 4, 5, undefined),
        }),
        (members, filters) => {
          const result = filterTeamMembers(members, filters);

          for (const member of result) {
            if (filters.status) {
              expect(member.status).toBe(filters.status);
            }
            if (filters.leg) {
              expect(member.legFromRoot).toBe(filters.leg);
            }
            if (filters.level !== undefined) {
              expect(member.depthFromRoot).toBe(filters.level);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no member satisfying all conditions is excluded', () => {
    fc.assert(
      fc.property(
        fc.array(teamMemberArb, { minLength: 1, maxLength: 30 }),
        fc.record({
          status: fc.constantFrom('ACTIVE', 'INACTIVE', 'SUSPENDED', undefined),
          leg: fc.constantFrom('left', 'right', undefined),
          level: fc.constantFrom(1, 2, 3, 4, 5, undefined),
        }),
        (members, filters) => {
          const result = filterTeamMembers(members, filters);

          for (const member of members) {
            const matchesStatus = !filters.status || member.status === filters.status;
            const matchesLeg = !filters.leg || member.legFromRoot === filters.leg;
            const matchesLevel = filters.level === undefined || member.depthFromRoot === filters.level;

            if (matchesStatus && matchesLeg && matchesLevel) {
              expect(result).toContainEqual(member);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 8: Property Filter Consistency ──────────────────────────────────

describe('Feature: investors-world-platform, Property 8: Property Filter Consistency', () => {
  it('all returned properties match ALL filter criteria', () => {
    fc.assert(
      fc.property(
        fc.array(propertyArb, { minLength: 1, maxLength: 20 }),
        fc.record({
          location: fc.constantFrom('Mumbai', 'Delhi', undefined),
          minPrice: fc.constantFrom(500000, 1000000, undefined),
          maxPrice: fc.constantFrom(5000000, 50000000, undefined),
          type: fc.constantFrom('PLOT', 'FLAT', 'VILLA', undefined),
          status: fc.constantFrom('AVAILABLE', 'BOOKED', undefined),
        }),
        (properties, filters) => {
          const result = filterProperties(properties, filters);

          for (const prop of result) {
            expect(prop.deletedAt).toBeNull();

            if (filters.status) {
              expect(prop.status).toBe(filters.status);
            } else {
              expect(prop.status).toBe('AVAILABLE');
            }

            if (filters.type) {
              expect(prop.type).toBe(filters.type);
            }

            if (filters.location) {
              const loc = filters.location.toLowerCase();
              const matchesLocation =
                (prop.location && prop.location.toLowerCase().includes(loc)) ||
                (prop.city && prop.city.toLowerCase().includes(loc)) ||
                (prop.state && prop.state.toLowerCase().includes(loc));
              expect(matchesLocation).toBe(true);
            }

            if (filters.minPrice !== undefined) {
              expect(prop.price).toBeGreaterThanOrEqual(filters.minPrice);
            }
            if (filters.maxPrice !== undefined) {
              expect(prop.price).toBeLessThanOrEqual(filters.maxPrice);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('no matching property is excluded from results', () => {
    fc.assert(
      fc.property(
        fc.array(propertyArb, { minLength: 1, maxLength: 20 }),
        fc.record({
          location: fc.constantFrom(undefined),
          minPrice: fc.constantFrom(undefined),
          maxPrice: fc.constantFrom(undefined),
          type: fc.constantFrom('PLOT', 'FLAT', undefined),
          status: fc.constantFrom('AVAILABLE', undefined),
        }),
        (properties, filters) => {
          const result = filterProperties(properties, filters);

          for (const prop of properties) {
            if (prop.deletedAt !== null) continue;

            const matchesStatus = filters.status
              ? prop.status === filters.status
              : prop.status === 'AVAILABLE';
            const matchesType = !filters.type || prop.type === filters.type;

            if (matchesStatus && matchesType) {
              expect(result).toContainEqual(prop);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 11: Soft-Delete Exclusion ───────────────────────────────────────

describe('Feature: investors-world-platform, Property 11: Soft-Delete Exclusion', () => {
  it('no record with deletedAt set appears in filtered results', () => {
    fc.assert(
      fc.property(
        fc.array(softDeletableRecordArb, { minLength: 1, maxLength: 50 }),
        (records) => {
          const result = filterOutDeleted(records);

          for (const record of result) {
            expect(record.deletedAt).toBeNull();
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('all non-deleted records are preserved', () => {
    fc.assert(
      fc.property(
        fc.array(softDeletableRecordArb, { minLength: 1, maxLength: 50 }),
        (records) => {
          const result = filterOutDeleted(records);
          const nonDeleted = records.filter((r) => r.deletedAt === null);

          expect(result.length).toBe(nonDeleted.length);
          for (const record of nonDeleted) {
            expect(result).toContainEqual(record);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('filtered count <= original count', () => {
    fc.assert(
      fc.property(
        fc.array(softDeletableRecordArb, { minLength: 0, maxLength: 50 }),
        (records) => {
          const result = filterOutDeleted(records);
          expect(result.length).toBeLessThanOrEqual(records.length);
        },
      ),
      { numRuns: 100 },
    );
  });
});

// ─── Property 20: Property Booking Availability Guard ─────────────────────────

describe('Feature: investors-world-platform, Property 20: Property Booking Availability Guard', () => {
  it('only AVAILABLE properties accept bookings', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('AVAILABLE', 'BOOKED', 'SOLD'),
        (status) => {
          const canBook = canBookProperty(status);
          if (status === 'AVAILABLE') {
            expect(canBook).toBe(true);
          } else {
            expect(canBook).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('BOOKED properties always reject booking attempts', () => {
    expect(canBookProperty('BOOKED')).toBe(false);
  });

  it('SOLD properties always reject booking attempts', () => {
    expect(canBookProperty('SOLD')).toBe(false);
  });

  it('booking guard is deterministic for any status', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('AVAILABLE', 'BOOKED', 'SOLD'),
        (status) => {
          const result1 = canBookProperty(status);
          const result2 = canBookProperty(status);
          expect(result1).toBe(result2);
        },
      ),
      { numRuns: 100 },
    );
  });
});
