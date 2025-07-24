import React from 'react'
import { Search, HelpCircle, Music } from 'lucide-react'

const Navbar = ({ onSearch }) => {
  const [query, setQuery] = React.useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(query)
  }

  return (
    <nav className='fixed top-0 left-0 right-0 bg-black bg-opacity-30 backdrop-blur-md h-20 flex items-center justify-between px-8 z-50'>
      <div className='flex items-center gap-4'>
        <div className='text-2xl font-bold'>GREEN HOUSE</div>
      </div>

      <div className='flex-1 flex justify-center px-16'>
        <form
          onSubmit={handleSearch}
          className='w-full max-w-md bg-black bg-opacity-20 rounded-full flex items-center px-4'>
          <Search className='text-gray-400' />
          <input
            type='text'
            placeholder='Search for songs or artists...'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className='bg-transparent w-full h-12 px-4 text-white placeholder-gray-400 focus:outline-none'
          />
        </form>
      </div>

      <div className='flex items-center gap-6'>
        <button className='text-gray-300 hover:text-white transition-colors'>
          <HelpCircle size={24} />
        </button>
        <div className='flex items-center gap-2 text-lg'>
          <Music size={24} />
          <span>Melody Haven</span>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
