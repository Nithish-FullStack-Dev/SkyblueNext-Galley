import { FlightOrder } from "@prisma/client";

interface SectionProps {
  title: string;
  flights: FlightOrder[];
  loading?: boolean;
  faded?: boolean;
  className?: string;
}

const Section = ({
  title,
  flights,
  loading = false,
  faded = false,
  className,
}: SectionProps) => {
  if (loading) {
    return (
      <section className={`w-full py-12 px-4 md:px-8 ${className || ""}`}>
        <div className="max-w-7xl mx-auto text-sm text-muted-foreground">
          Loading...
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full py-12 px-4 md:px-8 ${faded ? "opacity-60" : ""} ${
        className || ""
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-semibold mb-6">{title}</h2>

        <div className="space-y-4">
          {flights.length === 0 && (
            <div className="p-6 border rounded-2xl text-center text-muted-foreground">
              No flights found
            </div>
          )}

          {flights.map((f) => (
            <div
              key={f.id}
              className="p-5 border rounded-2xl flex justify-between items-center hover:shadow-md transition"
            >
              <div>
                <h3 className="font-semibold">
                  {f.departure} → {f.arrival}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {f.flightNumber} • {f.tailNumber}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(f.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Section;
