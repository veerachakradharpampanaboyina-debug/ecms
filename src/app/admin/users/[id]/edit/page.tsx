'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// This would typically be a more complex form, dynamically generated based on user role.
// For simplicity, we'll allow editing of core user details.

export default function EditUserPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();
  const userId = params.id as string;

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated') {
      if ((session.user as any)?.role !== 'ADMIN') {
        router.push('/');
      } else if (userId) {
        fetchUserData();
      }
    } else if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [session, status, router, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await res.json();
      setUser(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setUser((prev: any) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update user');
      }

      toast({ title: 'Success', description: 'User updated successfully.' });
      router.push('/admin/users');
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (loading || status === 'loading') {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (!user) {
    return <div className="flex h-screen items-center justify-center">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit User: {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={user.name || ''} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email || ''} onChange={handleInputChange} />
            </div>
            {/* Add more fields for other user properties as needed */}
            {/* For example, for a student's details */}
            {user.role === 'STUDENT' && user.details && (
              <div className="p-4 border rounded-md space-y-4">
                <h3 className="font-semibold">Student Details</h3>
                 <div>
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <Input id="rollNumber" value={user.details.rollNumber || ''} onChange={(e) => setUser({...user, details: {...user.details, rollNumber: e.target.value}})} />
                </div>
                 <div>
                    <Label htmlFor="courseId">Course ID</Label>
                    <Input id="courseId" value={user.details.courseId || ''} onChange={(e) => setUser({...user, details: {...user.details, courseId: e.target.value}})} />
                </div>
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
