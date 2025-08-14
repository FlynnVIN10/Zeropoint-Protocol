module.exports = {
  CID: {
    parse: jest.fn().mockReturnValue('mock-cid'),
    asCID: jest.fn().mockReturnValue('mock-cid')
  }
}; 