// A board holds objects; every object belongs to exactly one board.
export interface Board {
  id: string
  name: string
  createdAt: string
}

// Someone who has logged in and belongs to a board.
export interface Member {
  id: string
  name: string
  avatarUrl?: string
}

// In the overview, every board comes with its members.
export interface BoardWithMembers extends Board {
  members: Member[]
}
