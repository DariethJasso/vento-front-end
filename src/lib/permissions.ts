import { Session } from "next-auth";

export function isOwner(session: Session | null): boolean {
  return !!(session?.user?.isOwner || session?.user?.isEmployeeOwner);
}

export function isManager(session: Session | null): boolean {
  return !!session?.user?.isManager;
}

export function isCashier(session: Session | null): boolean {
  return !!session?.user?.isCashier;
}

export function isWaiter(session: Session | null): boolean {
  return !!session?.user?.isWaiter;
}

export function canAccessPanel(session: Session | null): boolean {
  return isOwner(session) || isManager(session);
}

export function canAccessPOS(session: Session | null): boolean {
  return !!(session?.user?.isCashier || session?.user?.isWaiter || isOwner(session) || isManager(session));
}

export function canManageAllBranches(session: Session | null): boolean {
  return isOwner(session);
}

export function canManageOwnBranch(session: Session | null): boolean {
  return isManager(session);
}

export function canViewAllEmployees(session: Session | null): boolean {
  return isOwner(session);
}

export function canViewBranchEmployees(session: Session | null): boolean {
  return isManager(session);
}

export function canEditAllItems(session: Session | null): boolean {
  return isOwner(session);
}

export function canEditBranchItems(session: Session | null): boolean {
  return isManager(session);
}

export function getUserBranchId(session: Session | null): string | undefined {
  return session?.user?.branchId;
}

export function canManageShifts(session: Session | null): boolean {
  return isOwner(session) || isManager(session);
}
