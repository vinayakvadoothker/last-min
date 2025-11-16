import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, DollarSign, Sparkles, TrendingDown, Users } from 'lucide-react'
import { Nav } from '@/components/nav'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LandingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is signed in, redirect to activities
  if (user) {
    redirect('/activities')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <Nav />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-sm text-blue-700 mb-6">
            <Sparkles className="h-4 w-4" />
            <span>Discover Last-Minute Activities Near You</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
            Never Miss Out on
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Amazing Experiences
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Find discounted last-minute activities, classes, and events near you. 
            Book instantly and save up to 60% on amazing experiences.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6">
                Start Exploring
              </Button>
            </Link>
            <Link href="/activities">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Browse Activities
              </Button>
            </Link>
            <Link href="/partner">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Partner With Us
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-gray-900">1000+</div>
              <div className="text-sm text-gray-600">Activities</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">50%</div>
              <div className="text-sm text-gray-600">Average Savings</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900">24/7</div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Last-Min?</h2>
            <p className="text-xl text-gray-600">
              The easiest way to discover and book last-minute activities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Nearby Activities</h3>
              <p className="text-gray-600">
                Find activities close to you with our location-based search. 
                Never travel far for amazing experiences.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingDown className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Huge Discounts</h3>
              <p className="text-gray-600">
                Save up to 60% on activities. The closer to the event time, 
                the bigger the discount.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Booking</h3>
              <p className="text-gray-600">
                Book in seconds with Apple Pay. Get instant confirmation 
                and QR codes for easy check-in.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">
                Compare prices across providers. We show you the best deals 
                available right now.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Verified Providers</h3>
              <p className="text-gray-600">
                All providers are verified and rated by our community. 
                Book with confidence.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Surprise Activities</h3>
              <p className="text-gray-600">
                Try our mystery activities for an extra discount. 
                Discover something new and exciting.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Exploring?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of users discovering amazing last-minute activities every day.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Create Free Account
                </Button>
              </Link>
              <Link href="/activities">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Browse Activities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 md:mb-0">
              Last-Min
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <Link href="/activities" className="hover:text-gray-900">Activities</Link>
              <Link href="/login" className="hover:text-gray-900">Sign In</Link>
              <Link href="/signup" className="hover:text-gray-900">Sign Up</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Last-Min. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
