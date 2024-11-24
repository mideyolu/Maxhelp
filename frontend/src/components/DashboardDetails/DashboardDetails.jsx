import React from "react";
import { Card, Typography } from "@material-tailwind/react";

const DashboardDetails = ({ title, subtitle, summaryData }) => {
  return (
    <div>
      {/* Title and Subtitle */}
      <div className="mb-8 text-left">
        <Typography variant="h3" color="blue-gray">
          {title}
        </Typography>
        <Typography variant="h6" color="blue-gray">
          {subtitle}
        </Typography>
      </div>

      {/* Summary Box */}
      <div className="mb-8 w-full grid grid-cols-1 md:grid-cols-2 gap-8">
        {summaryData.map((item, index) => (
          <Card
            key={index}
            color="transparent"
            shadow={2}
            className="flex flex-col w-[100%] h-[150px] items-start justify-center p-4"
          >
            <Typography
              variant="h6"
              color="gray"
              className="mb-2 text-left text-[0.9rem]"
            >
              {item.title}
            </Typography>
            <Typography variant="h4" color="blue-gray">
              {item.value}
            </Typography>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DashboardDetails;
