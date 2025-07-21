const { interpolatePrice } = require('../src/services/interpolationService');

describe('Interpolation Service', () => {
  // Test 1: Normal interpolation between two prices
  test('should interpolate correctly between two prices', () => {
    const queryTimestamp = 1500;
    const beforeTimestamp = 1000;
    const beforePrice = 100;
    const afterTimestamp = 2000;
    const afterPrice = 200;
    
    const result = interpolatePrice(
      queryTimestamp,
      beforeTimestamp,
      beforePrice,
      afterTimestamp,
      afterPrice
    );
    
    // Expected result: 100 + (200 - 100) * ((1500 - 1000) / (2000 - 1000))
    // = 100 + 100 * 0.5 = 150
    expect(result).toBe(150);
  });
  
  // Test 2: Edge case - query timestamp equals before timestamp
  test('should return before price when query timestamp equals before timestamp', () => {
    const queryTimestamp = 1000;
    const beforeTimestamp = 1000;
    const beforePrice = 100;
    const afterTimestamp = 2000;
    const afterPrice = 200;
    
    const result = interpolatePrice(
      queryTimestamp,
      beforeTimestamp,
      beforePrice,
      afterTimestamp,
      afterPrice
    );
    
    expect(result).toBe(100);
  });
  
  // Test 3: Edge case - query timestamp equals after timestamp
  test('should return after price when query timestamp equals after timestamp', () => {
    const queryTimestamp = 2000;
    const beforeTimestamp = 1000;
    const beforePrice = 100;
    const afterTimestamp = 2000;
    const afterPrice = 200;
    
    const result = interpolatePrice(
      queryTimestamp,
      beforeTimestamp,
      beforePrice,
      afterTimestamp,
      afterPrice
    );
    
    expect(result).toBe(200);
  });
  
  // Test 4: Error case - invalid timestamp range
  test('should throw error when query timestamp is out of range', () => {
    const queryTimestamp = 500;
    const beforeTimestamp = 1000;
    const beforePrice = 100;
    const afterTimestamp = 2000;
    const afterPrice = 200;
    
    expect(() => {
      interpolatePrice(
        queryTimestamp,
        beforeTimestamp,
        beforePrice,
        afterTimestamp,
        afterPrice
      );
    }).toThrow('Query timestamp out of range');
    
    const queryTimestamp2 = 2500;
    expect(() => {
      interpolatePrice(
        queryTimestamp2,
        beforeTimestamp,
        beforePrice,
        afterTimestamp,
        afterPrice
      );
    }).toThrow('Query timestamp out of range');
  });
  
  // Test 5: Interpolation with price decrease
  test('should interpolate correctly with decreasing prices', () => {
    const queryTimestamp = 1500;
    const beforeTimestamp = 1000;
    const beforePrice = 200;
    const afterTimestamp = 2000;
    const afterPrice = 100;
    
    const result = interpolatePrice(
      queryTimestamp,
      beforeTimestamp,
      beforePrice,
      afterTimestamp,
      afterPrice
    );
    
    // Expected result: 200 + (100 - 200) * ((1500 - 1000) / (2000 - 1000))
    // = 200 + (-100) * 0.5 = 150
    expect(result).toBe(150);
  });
});
