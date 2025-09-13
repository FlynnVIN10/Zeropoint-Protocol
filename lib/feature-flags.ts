// CTO Directive: Utility compliance check
export function utility() {
  // CTO Directive: Block utility when MOCKS_DISABLED=1
  if (process.env.MOCKS_DISABLED === '1') {
    throw new Error('Utility temporarily unavailable - MOCKS_DISABLED=1 enforced')
  }
  
  throw new Error('Utility not implemented')
}

export default utility