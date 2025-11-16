'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut, User, Calendar, MapPin, Building2, Shield, Menu, X, Sparkles, Zap } from 'lucide-react'
import { useEffect, useState } from 'react'

export function Nav() {
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) {
        loadUserRole(user.id, user.email)
      }
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserRole(session.user.id, session.user.email)
      } else {
        setUserRole(null)
      }
    })
  }, [supabase])

  const loadUserRole = async (userId: string, userEmail?: string) => {
    // Always grant admin access to vinvadoothker@gmail.com
    if (userEmail === 'vinvadoothker@gmail.com') {
      setUserRole('admin')
      // Also ensure the profile is updated in the database
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (existingProfile) {
        // Update to admin if not already
        if (existingProfile.role !== 'admin') {
          await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', userId)
        }
      } else {
        // Create profile with admin role
        await supabase
          .from('profiles')
          .insert({
            id: userId,
            email: userEmail,
            role: 'admin',
          })
      }
      return
    }

    // For other users, load role from database
    const { data } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', userId)
      .single()
    
    if (data) {
      setUserRole(data.role)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const isSuperAdmin = user?.email === 'vinvadoothker@gmail.com'
  const hasPlatformAccess = userRole === 'provider' || isSuperAdmin

  return (
    <nav className="border-b border-gray-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-sm opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 transition-all">
              Last-Min
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/activities">
              <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                <MapPin className="h-4 w-4 mr-2" />
                Activities
              </Button>
            </Link>
            {user && (
              <>
                <Link href="/bookings">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                    <Calendar className="h-4 w-4 mr-2" />
                    My Bookings
                  </Button>
                </Link>
                
                {/* Platform Access Button - Prominent for Providers/Admins */}
                {hasPlatformAccess && (
                  <Link href="/provider/dashboard">
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all ml-2"
                    >
                      <Building2 className="h-4 w-4 mr-2" />
                      Platform
                    </Button>
                  </Link>
                )}
                
                {isSuperAdmin && (
                  <Link href="/admin">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                      <Shield className="h-4 w-4 mr-2" />
                      Admin
                    </Button>
                  </Link>
                )}
                
                {!hasPlatformAccess && (
                  <Link href="/partner">
                    <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                      <Building2 className="h-4 w-4 mr-2" />
                      Partner
                    </Button>
                  </Link>
                )}
                
                <div className="h-6 w-px bg-gray-300 mx-2" />
                
                <Link href="/profile">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100/80">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50/80"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            )}
            {!user && (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-gray-700 hover:text-gray-900">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    size="sm" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all"
                  >
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/98 backdrop-blur-sm">
            <div className="py-3 space-y-1">
              <Link href="/activities" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100/80">
                  <MapPin className="h-4 w-4 mr-2" />
                  Activities
                </Button>
              </Link>
              {user && (
                <>
                  <Link href="/bookings" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100/80">
                      <Calendar className="h-4 w-4 mr-2" />
                      My Bookings
                    </Button>
                  </Link>
                  
                  {/* Platform Access Button - Mobile */}
                  {hasPlatformAccess && (
                    <Link href="/provider/dashboard" onClick={() => setMobileMenuOpen(false)}>
                      <Button 
                        className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Platform
                      </Button>
                    </Link>
                  )}
                  
                  {isSuperAdmin && (
                    <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100/80">
                        <Shield className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  
                  {!hasPlatformAccess && (
                    <Link href="/partner" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100/80">
                        <Building2 className="h-4 w-4 mr-2" />
                        Partner With Us
                      </Button>
                    </Link>
                  )}
                  
                  <div className="h-px bg-gray-200 my-2" />
                  
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-100/80">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-gray-700 hover:text-red-600 hover:bg-red-50/80"
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
              {!user && (
                <>
                  <div className="px-3 py-2 space-y-2">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start text-gray-700">Sign In</Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
