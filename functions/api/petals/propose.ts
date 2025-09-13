// CTO Directive: Service compliance check
export class Service {
  constructor() {
    // CTO Directive: Block service when MOCKS_DISABLED=1
    if (process.env.MOCKS_DISABLED === '1') {
      throw new Error('Service temporarily unavailable - MOCKS_DISABLED=1 enforced')
    }
  }

  async execute() {
    throw new Error('Service not implemented')
  }
}

export default Service