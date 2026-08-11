import { useOthers } from "@liveblocks/react/suspense";
import { UserMenu } from "./user-menu";

export function ParticipantGroup() {
  const others = useOthers();
  
  // Show up to 5 collaborators
  const maxCollaborators = 5;
  const visibleCollaborators = others.slice(0, maxCollaborators);
  const hiddenCount = others.length - maxCollaborators;

  return (
    <div className="flex items-center gap-2 bg-bg-elevated/95 backdrop-blur-md border border-border-subtle p-1.5 rounded-2xl shadow-xl pointer-events-auto">
      <div className="flex items-center -space-x-2 mr-1">
        {/* Always render Glyph AI as the permanent co-pilot */}
        <div 
          className="relative w-8 h-8 rounded-full border-2 border-bg-elevated flex items-center justify-center bg-accent-primary text-bg-base z-[11] shadow-sm"
          title="Glyph AI Co-pilot"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
        </div>
        
        {visibleCollaborators.map((collaborator) => {
            const { name, avatar, color } = collaborator.info;
            return (
              <div 
                key={collaborator.connectionId}
                className="relative w-8 h-8 rounded-full border-2 border-bg-elevated flex items-center justify-center text-xs font-semibold overflow-hidden"
                style={{ backgroundColor: color || "#52A8FF", zIndex: 10 }}
                title={name}
              >
                {avatar ? (
                  <img src={avatar} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white drop-shadow-md">
                    {name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <div 
              className="relative w-8 h-8 rounded-full border-2 border-bg-elevated bg-bg-surface flex items-center justify-center text-xs font-semibold text-text-secondary z-0"
              title={`${hiddenCount} more collaborators`}
            >
              +{hiddenCount}
            </div>
          )}
        </div>

      <div className="w-[1px] h-5 bg-border-subtle" />

      {/* Current User */}
      <div className="flex items-center z-20">
        <UserMenu />
      </div>
    </div>
  );
}
