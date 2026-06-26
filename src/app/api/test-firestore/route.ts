import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/firebase-admin';
import { debugRouteGuard } from '@/lib/debug-guard';

export async function POST(request: NextRequest) {
  const blocked = debugRouteGuard();
  if (blocked) return blocked;
  try {
    const body = await request.json();
    const { action, collection, docId, data } = body;
    
    console.log('🔥 Testing Firestore access:', { action, collection, docId });
    
    if (action === 'write') {
      // Test write operation
      const docRef = firestore.collection(collection).doc(docId);
      await docRef.set(data);
      
      console.log('✅ Firestore write successful');
      return NextResponse.json({
        success: true,
        action: 'write',
        collection,
        docId,
        message: 'Document written successfully'
      });
      
    } else if (action === 'read') {
      // Test read operation
      const docRef = firestore.collection(collection).doc(docId);
      const doc = await docRef.get();
      
      if (doc.exists) {
        console.log('✅ Firestore read successful');
        return NextResponse.json({
          success: true,
          action: 'read',
          collection,
          docId,
          data: doc.data(),
          message: 'Document read successfully'
        });
      } else {
        console.log('⚠️ Document not found');
        return NextResponse.json({
          success: false,
          action: 'read',
          collection,
          docId,
          message: 'Document not found'
        });
      }
      
    } else {
      return NextResponse.json({
        success: false,
        error: 'Invalid action. Use "read" or "write"'
      }, { status: 400 });
    }
    
  } catch (error) {
    console.error('❌ Firestore test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const blocked = debugRouteGuard();
  if (blocked) return blocked;
  return NextResponse.json({
    message: 'Firestore Test API',
    description: 'Test Firebase Admin SDK Firestore access',
    endpoints: {
      POST: {
        description: 'Test Firestore read/write operations',
        body: {
          action: '"read" or "write"',
          collection: 'Firestore collection name',
          docId: 'Document ID',
          data: 'Data to write (only for write action)'
        }
      }
    },
    examples: {
      write: {
        action: 'write',
        collection: 'test-admin',
        docId: 'test-doc-123',
        data: { name: 'test', value: 42 }
      },
      read: {
        action: 'read',
        collection: 'users',
        docId: 'user-123'
      }
    }
  });
} 