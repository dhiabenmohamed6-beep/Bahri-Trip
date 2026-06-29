import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Program from '@/components/Program'
import Services from '@/components/Services'
import Booking from '@/components/Booking'
import Contact from '@/components/Contact'
import AquaAskChat from '@/components/AquaAskChat'

export default function HomePage(){
 return(
 <main>
 <Navbar/>
 <Hero/>
 <Program/>
 <Services/>
 <Booking/>
 <Contact/>
 <AquaAskChat/>
 </main>
 )
}
