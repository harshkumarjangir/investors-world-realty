import { getProperties } from '@/lib/api';
import PropertyCard from '@/components/properties/PropertyCard';
import PropertyFilters from '@/components/properties/PropertyFilters';

export const metadata = {
  title: 'Our Properties | Investor\'s World Realty',
  description: 'Browse our exclusive selection of premium properties.',
};

export default async function PropertiesPage({ searchParams }) {
  // Fetch properties using the URL search params
  const { data: properties, totalItems } = await getProperties(searchParams);

  return (
    <div className="bg-[#fafafa] min-h-screen pb-16">
      {/* Page Header */}
      <div className="bg-[#0a0f1a] text-white pt-32 pb-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-serif mb-4">Discover Your Future Home</h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Browse our curated list of premium residential and commercial properties.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <PropertyFilters currentParams={searchParams} />
          </div>
          
          {/* Properties Grid */}
          <div className="w-full lg:w-3/4">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-2xl font-serif text-[#0a0f1a]">
                Showing {properties?.length || 0} of {totalItems || 0} properties
              </h2>
            </div>

            {!properties || properties.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xl font-medium text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500">Try adjusting your filters to find what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
