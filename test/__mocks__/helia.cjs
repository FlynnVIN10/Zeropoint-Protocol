module.exports = {
  createHelia: jest.fn().mockResolvedValue({
    start: jest.fn(),
    stop: jest.fn(),
    libp2p: {
      getConnections: jest.fn().mockReturnValue([])
    }
  })
}; 