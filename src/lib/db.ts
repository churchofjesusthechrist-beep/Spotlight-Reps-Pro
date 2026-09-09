import { db, auth, handleFirestoreError, OperationType } from './firebase';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { RepProfile, Board, Referral, Sponsor, FollowUp, Script, BoardStatus } from './types';

export const dbApi = {
  // Profiles
  async getProfile(userId: string): Promise<RepProfile | null> {
    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) return snap.data() as RepProfile;
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
      return null;
    }
  },

  async saveProfile(profile: RepProfile): Promise<void> {
    try {
      const existing = await this.getProfile(profile.id);
      if (existing) {
        await updateDoc(doc(db, 'users', profile.id), profile as any);
      } else {
        await setDoc(doc(db, 'users', profile.id), {
          ...profile,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${profile.id}`);
    }
  },

  // Boards
  async getBoards(): Promise<Board[]> {
    try {
      // Reps can only read their boards, Admins can read all.
      const userId = auth.currentUser?.uid;
      const profile = userId ? await this.getProfile(userId) : null;
      let q = collection(db, 'boards') as any;
      
      if (!profile?.isAdmin && userId) {
        q = query(collection(db, 'boards'), where('assignedRepId', '==', userId));
      }
      
      const snap = await getDocs(q);
      return snap.docs.map(d => d.data() as Board);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'boards');
      return [];
    }
  },

  async getBoard(id: string): Promise<Board | null> {
    try {
      const snap = await getDoc(doc(db, 'boards', id));
      if (snap.exists()) return snap.data() as Board;
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `boards/${id}`);
      return null;
    }
  },

  async saveBoard(board: Board): Promise<void> {
    try {
      const existing = await this.getBoard(board.id);
      if (existing) {
        await updateDoc(doc(db, 'boards', board.id), board as any);
      } else {
        await setDoc(doc(db, 'boards', board.id), {
          ...board,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `boards/${board.id}`);
    }
  },

  async deleteBoard(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, 'boards', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `boards/${id}`);
    }
  },

  // Referrals
  async getReferralsForBoard(boardId: string): Promise<Referral[]> {
    try {
      const snap = await getDocs(collection(db, `boards/${boardId}/referrals`));
      return snap.docs.map(d => d.data() as Referral);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `boards/${boardId}/referrals`);
      return [];
    }
  },

  async saveReferral(referral: Referral): Promise<void> {
    try {
      const existingSnap = await getDoc(doc(db, `boards/${referral.boardId}/referrals`, referral.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, `boards/${referral.boardId}/referrals`, referral.id), referral as any);
      } else {
        await setDoc(doc(db, `boards/${referral.boardId}/referrals`, referral.id), {
          ...referral,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `boards/${referral.boardId}/referrals/${referral.id}`);
    }
  },

  // Sponsors
  async getSponsorsForBoard(boardId: string): Promise<Sponsor[]> {
    try {
      const snap = await getDocs(collection(db, `boards/${boardId}/sponsors`));
      return snap.docs.map(d => d.data() as Sponsor);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, `boards/${boardId}/sponsors`);
      return [];
    }
  },

  async saveSponsor(sponsor: Sponsor): Promise<void> {
    try {
      const existingSnap = await getDoc(doc(db, `boards/${sponsor.boardId}/sponsors`, sponsor.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, `boards/${sponsor.boardId}/sponsors`, sponsor.id), sponsor as any);
      } else {
        await setDoc(doc(db, `boards/${sponsor.boardId}/sponsors`, sponsor.id), {
          ...sponsor,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `boards/${sponsor.boardId}/sponsors/${sponsor.id}`);
    }
  },

  // FollowUps
  async getFollowUps(): Promise<FollowUp[]> {
    try {
      // Just returning empty since it requires getting boards first for reps
      // A full implementation would query across assigned boards.
      const boards = await this.getBoards();
      const allFollowUps: FollowUp[] = [];
      for (const board of boards) {
        const snap = await getDocs(collection(db, `boards/${board.id}/followups`));
        allFollowUps.push(...snap.docs.map(d => d.data() as FollowUp));
      }
      return allFollowUps;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'followups');
      return [];
    }
  },

  async saveFollowUp(followUp: FollowUp): Promise<void> {
    try {
      const existingSnap = await getDoc(doc(db, `boards/${followUp.boardId}/followups`, followUp.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, `boards/${followUp.boardId}/followups`, followUp.id), followUp as any);
      } else {
        await setDoc(doc(db, `boards/${followUp.boardId}/followups`, followUp.id), {
          ...followUp,
          createdAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `boards/${followUp.boardId}/followups/${followUp.id}`);
    }
  },

  // Scripts
  async getScripts(): Promise<Script[]> {
    try {
      const snap = await getDocs(collection(db, 'scripts'));
      return snap.docs.map(d => d.data() as Script);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'scripts');
      return [];
    }
  },

  async saveScript(script: Script): Promise<void> {
    try {
      const existingSnap = await getDoc(doc(db, 'scripts', script.id));
      if (existingSnap.exists()) {
        await updateDoc(doc(db, 'scripts', script.id), {
          ...script,
          updatedAt: serverTimestamp()
        });
      } else {
        await setDoc(doc(db, 'scripts', script.id), {
          ...script,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `scripts/${script.id}`);
    }
  },
  
  async deleteScript(scriptId: string): Promise<void> {
     try {
       await deleteDoc(doc(db, 'scripts', scriptId));
     } catch(error) {
       handleFirestoreError(error, OperationType.DELETE, `scripts/${scriptId}`);
     }
  },

  async initializeDefaultScripts(): Promise<void> {
    const scripts = await this.getScripts();
    if (scripts.length === 0) {
      // These are default seeded scripts from prompt
      const defaults: Script[] = [
        {
          id: 'script-1',
          title: 'Message 1: Pitch',
          category: 'Restaurant',
          content: 'Hey [First Name] — I put together a quick mock-up for [Restaurant Name] because I think this would look great in your space.\n\n[MOCK-UP IMAGE]\n\nWe’re selecting a small number of local restaurants for a custom Local Spotlight Board — professionally designed, printed, and delivered completely free.\n\nUse it for daily specials, customer favorites, events, happy hour, or whatever you want to highlight.\n\nA few trusted local businesses sponsor the bottom strip and cover the entire cost. You pick which local businesses we invite, so it stays connected to businesses you already know, trust, or recommend.\n\nYou don\'t have to sell anything or manage sponsors — we handle everything.\n\nWe only have a couple of restaurant placements left in this round. Want me to reserve one for [Restaurant Name]?\n\nJust reply YES and I’ll hold it for you.',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'script-2',
          title: 'Message 2: Referrals',
          category: 'Restaurant',
          content: 'Perfect — I’ve got [Restaurant Name] reserved. 🎯\n\nWho are 3 local businesses you already know, trust, or recommend? Think realtor, insurance agent, plumber, dentist, contractor, auto shop, etc.\n\nJust type the names here, send their social links, or snap a quick photo of your business-card holder or flyer rack.\n\nWe handle 100% of the outreach — you don\'t have to contact or sell anybody.\n\nJust send me the first 3 that come to mind.',
          updatedAt: new Date().toISOString()
        },
        {
          id: 'script-3',
          title: 'Message 3: Follow Up',
          category: 'Restaurant',
          content: 'Hey [First Name] — just circling back on the Local Spotlight Board I mocked up for [Restaurant Name].\n\n[MOCK-UP IMAGE]\n\nI’m wrapping up this round and wanted to give you first option before I offer the placement to another restaurant.\n\nWant me to keep it reserved for [Restaurant Name]?\n\nJust reply YES and it’s yours.',
          updatedAt: new Date().toISOString()
        }
      ];

      for (const s of defaults) {
        await this.saveScript(s);
      }
    }
  }
};
