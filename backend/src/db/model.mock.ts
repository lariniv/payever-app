import { Model } from 'mongoose';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any>;
};

export const modelMock: MockType<Model<any>> = {
  create: jest.fn(),
  findOne: jest.fn(),
  findById: jest.fn(),
  findOneAndDelete: jest.fn(),
};
