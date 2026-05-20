export default {
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn(),
      pdf: jest.fn().mockResolvedValue(Buffer.from('dummy pdf content')),
      close: jest.fn(),
    }),
    close: jest.fn(),
  }),
};
