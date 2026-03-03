import { describe, it, expect } from 'vitest';
import number2Chinese from '@/utils/number2Chinese';

describe('number2Chinese', () => {
  it('应该正确转换个位数', () => {
    expect(number2Chinese(0)).toBe('零');
    expect(number2Chinese(1)).toBe('一');
    expect(number2Chinese(5)).toBe('五');
    expect(number2Chinese(9)).toBe('九');
  });

  it('应该正确转换十位数', () => {
    expect(number2Chinese(10)).toBe('十');
    expect(number2Chinese(11)).toBe('十一');
    expect(number2Chinese(15)).toBe('十五');
    expect(number2Chinese(19)).toBe('十九');
    expect(number2Chinese(20)).toBe('二十');
    expect(number2Chinese(25)).toBe('二十五');
    expect(number2Chinese(99)).toBe('九十九');
  });

  it('应该正确转换百位数', () => {
    expect(number2Chinese(100)).toBe('一百');
    expect(number2Chinese(101)).toBe('一百零一');
    expect(number2Chinese(110)).toBe('一百一十');
    expect(number2Chinese(111)).toBe('一百一十一');
    expect(number2Chinese(200)).toBe('二百');
    expect(number2Chinese(999)).toBe('九百九十九');
  });

  it('应该正确转换千位数', () => {
    expect(number2Chinese(1000)).toBe('一千');
    expect(number2Chinese(1001)).toBe('一千零一');
    expect(number2Chinese(1010)).toBe('一千零一十');
    expect(number2Chinese(1100)).toBe('一千一百');
    expect(number2Chinese(9999)).toBe('九千九百九十九');
  });

  it('应该正确转换万位数', () => {
    expect(number2Chinese(10000)).toBe('一万');
    expect(number2Chinese(10001)).toBe('一万零一');
    expect(number2Chinese(10010)).toBe('一万零一十');
    expect(number2Chinese(10100)).toBe('一万零一百');
    expect(number2Chinese(11000)).toBe('一万一千');
    expect(number2Chinese(99999)).toBe('九万九千九百九十九');
  });

  it('应该正确处理零的情况', () => {
    expect(number2Chinese(1001)).toBe('一千零一');
    expect(number2Chinese(1010)).toBe('一千零一十');
    expect(number2Chinese(10001)).toBe('一万零一');
    expect(number2Chinese(10010)).toBe('一万零一十');
  });
});
