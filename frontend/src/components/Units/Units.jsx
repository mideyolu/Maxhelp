import units from "../../api/unit";
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
const Units = () => {
  return (
    <div className="container mt-[2.5rem] mx-auto px-4 py-2 lg:px-8 lg:py-4 cursor-pointer w-full ">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {units.map((unit, index) => (
          <Card
            key={index}
            className="shadow-lg hover:shadow-xl py-2 px-2 transition-shadow"
          >
            <div className="">
              <Typography variant="h5" color="" className="text-[1rem] text-center">
                {unit.unit_name}
              </Typography>
            </div>

            <CardBody className="flex items-start
            flex-col gap-2">
              <Typography variant="h6" className="mb-3">
                <strong>Location:</strong> {unit.unit_location}
              </Typography>
              <Typography>Description: {unit.description}</Typography>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Units;
