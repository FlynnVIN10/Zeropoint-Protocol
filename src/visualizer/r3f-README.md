# React Three Fiber Visualizer (Deprecated)

This module is deprecated as of Phase 11. All future visualizer development will use Unreal Engine 5.

## Deprecation Notice

**Effective Date**: Phase 11 (August 2025)  
**Replacement**: Unreal Engine 5 Visualizer  
**Reference**: See `docs/phase11-unreal-visualizer.md` for details

## Migration Path

### Current State
- React Three Fiber radial consensus wheel
- Server-Sent Events (SSE) streaming
- Real-time participant visualization

### Future State
- Unreal Engine 5 multi-agent rendering
- Advanced 3D visualization capabilities
- WebXR-ready module
- Enhanced performance and scalability

## Technical Details

### What's Being Replaced
- `src/visualizer/r3f/` - React Three Fiber components
- Radial consensus wheel visualization
- Basic agent representation

### What's Coming
- `src/visualizer/ue5-bridge.ts` - UE5 interface stub
- Multi-agent 3D rendering
- Intent arcs and consensus pulses
- Story-state time flow visualization
- Advanced entropy tracking

## Development Guidelines

### Phase 11 Transition
1. **Maintain Current Functionality**: R3F visualizer remains functional during transition
2. **No New R3F Development**: All new features use UE5
3. **Gradual Migration**: Existing features migrate to UE5 as Phase 11 progresses

### Code Maintenance
- R3F code will be archived but not removed
- Bug fixes only for critical issues
- No new features added to R3F components

## Timeline

- **Phase 10**: R3F remains primary visualizer
- **Phase 11.1-11.2**: UE5 development begins, R3F maintained
- **Phase 11.3-11.4**: UE5 becomes primary, R3F deprecated
- **Post Phase 11**: R3F archived, UE5 fully operational

## Contact

For questions about the migration to UE5:
- **Documentation**: `docs/phase11-unreal-visualizer.md`
- **Bridge Interface**: `src/visualizer/ue5-bridge.ts`
- **Development**: Private UE5 repository

---

**Note**: This deprecation ensures the Zeropoint Protocol visualizer evolves to meet advanced multi-agent interaction requirements while maintaining backward compatibility during the transition period. 