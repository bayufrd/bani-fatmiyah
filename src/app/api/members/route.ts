import { NextRequest, NextResponse } from 'next/server';
import { getAllMembers, getMemberById, createMember, updateMember, deleteMember, searchMembers, getMembersByGeneration, initDb } from '@/lib/db';

// Initialize database on startup
initDb();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const search = searchParams.get('search');
    const generation = searchParams.get('generation');

    // Helper function to parse member data
    const parseMember = (member: any) => {
      if (member && member.parentIds && typeof member.parentIds === 'string') {
        try {
          member.parentIds = JSON.parse(member.parentIds);
        } catch {
          member.parentIds = [];
        }
      }
      
      // Parse spouse from JSON string to object
      if (member && member.spouse && typeof member.spouse === 'string') {
        try {
          member.spouse = JSON.parse(member.spouse);
        } catch {
          // Keep as string if parse fails
        }
      }
      
      return member;
    };

    // Helper function to parse member array
    const parseMembers = (members: any[]) => {
      return members.map(m => parseMember(m));
    };

    if (id) {
      const numId = parseInt(id);
      const member = getMemberById(numId);
      if (!member) {
        return NextResponse.json({ error: 'Member not found' }, { status: 404 });
      }
      return NextResponse.json(parseMember(member));
    }

    if (search) {
      const results = searchMembers(search);
      return NextResponse.json(parseMembers(results));
    }

    if (generation) {
      const members = getMembersByGeneration(parseInt(generation));
      return NextResponse.json(parseMembers(members));
    }

    const members = getAllMembers();
    return NextResponse.json(parseMembers(members));
  } catch (error) {
    console.error('GET /api/members error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch members', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    
    // Convert parentIds to JSON string if it's an array
    if (data.parentIds && Array.isArray(data.parentIds)) {
      data.parentIds = JSON.stringify(data.parentIds);
    }
    
    // Convert spouse to JSON string if it's an object, or set to null if null
    if (data.spouse === null || data.spouse === undefined) {
      data.spouse = null;
    } else if (typeof data.spouse === 'object') {
      data.spouse = JSON.stringify(data.spouse);
    }
    
    const member = createMember(data);
    
    // Parse parentIds back to array for response
    if (member.parentIds && typeof member.parentIds === 'string') {
      try {
        member.parentIds = JSON.parse(member.parentIds);
      } catch {
        member.parentIds = [];
      }
    }
    
    // Parse spouse back to object for response
    if (member.spouse && typeof member.spouse === 'string') {
      try {
        member.spouse = JSON.parse(member.spouse);
      } catch {
        // Keep as string if parse fails
      }
    }
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error('POST /api/members error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create member', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const id = parseInt(idStr);
    const data = await req.json();
    
    // Convert parentIds to JSON string if it's an array
    if (data.parentIds && Array.isArray(data.parentIds)) {
      data.parentIds = JSON.stringify(data.parentIds);
    }
    
    // Convert spouse to JSON string if it's an object, or set to null/empty if null
    if (data.spouse === null || data.spouse === undefined) {
      data.spouse = null;
    } else if (typeof data.spouse === 'object') {
      data.spouse = JSON.stringify(data.spouse);
    }
    
    const member = updateMember(id, data);

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    // Parse parentIds back to array
    if (member.parentIds && typeof member.parentIds === 'string') {
      try {
        member.parentIds = JSON.parse(member.parentIds);
      } catch {
        member.parentIds = [];
      }
    }

    // Parse spouse back to object
    if (member.spouse && typeof member.spouse === 'string') {
      try {
        member.spouse = JSON.parse(member.spouse);
      } catch {
        // Keep as string if parse fails
      }
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('PUT /api/members error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update member', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const id = parseInt(idStr);
    const success = deleteMember(id);

    if (!success) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Member deleted' });
  } catch (error) {
    console.error('DELETE /api/members error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete member', 
        details: error instanceof Error ? error.message : String(error),
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}
