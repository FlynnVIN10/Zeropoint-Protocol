module.exports = {
  unixfs: jest.fn().mockReturnValue({
    addBytes: jest.fn().mockResolvedValue('mock-cid'),
    addFile: jest.fn().mockResolvedValue('mock-cid'),
    cat: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3])),
    ls: jest.fn().mockResolvedValue([])
  })
}; 