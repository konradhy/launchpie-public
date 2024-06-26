
"use client";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { FileEdit } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Detail } from "./detail";
import { InfoSection } from "./info-section";
import { usePersonsDetails } from "@/hooks/use-persons-details";
import { Skeleton } from "@/components/ui/skeleton";
import { Doc } from "@/convex/_generated/dataModel";

const CompanyDetailsCard = () => {
  const companyDetails = useQuery(api.companies.getByUserId);
  const {
    companyName = "loading...",
    address = "loading...",
    email = "loading...",
    phoneNumber = "loading...",
    industry = "loading...",
    status = "loading...",
    taxId = "loading...",
  } = companyDetails ?? {};
  const { directors = [], shareholders = [] } = companyDetails ?? {};
  const directorDetails = usePersonsDetails(
    directors.map((director) => director.personId),
  );
  const shareholderDetails = usePersonsDetails(
    shareholders.map((shareholder) => shareholder.personId),
  );

  if (!directorDetails || !shareholderDetails) {
    return (
      <Card className="overflow-y-auto bg-primary/5 rounded-lg shadow-inner dark:bg-slate-800">
        <CardHeader className="flex-row justify-between items-center  ">
          <div>
            <CardTitle className="dark:text-slate-100">
              {companyDetails?.companyName || "loading..."}
            </CardTitle>
            <CardDescription>Key details about your company</CardDescription>
          </div>

          <FileEdit
            type="button"
            className="mr-2 hover:text-slate-600 600 ml-auto cursor-pointer "
          />
        </CardHeader>

        <CardContent className="grid grid-cols-2 gap-4 p-6 bg-background  shadow">
          {/* Left column for general details */}
          <div>
            <Detail label="Name" value={companyName} />
            <Detail label="Entity type" value="Unregistered" />
            <Detail label="Status" value={status} />
            <Detail label="Tax ID" value={taxId} />
            <Skeleton className="h-8" />
          </div>
          {/* Right column for shareholder and director details */}
          <div>
            <Detail label="Business address" value={address} />
            <Detail label="Email" value={email} />
            <Detail label="Phone" value={phoneNumber} />
            <Detail label="Industry" value={industry} />
            <Skeleton className="h-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-y-auto bg-primary/5 rounded-lg shadow-inner dark:bg-slate-800">
      <CardHeader className="flex-row justify-between items-center  ">
        <div>
          <CardTitle className="dark:text-slate-100">
            {companyDetails?.companyName || "loading..."}
          </CardTitle>
          <CardDescription>Key details about your company</CardDescription>
        </div>

        <FileEdit
          type="button"
          className="mr-2 hover:text-slate-600 600 ml-auto cursor-pointer "
        />
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-4 p-6 bg-background  shadow">
        {/* Left column for general details */}
        <div>
          <Detail label="Name" value={companyName} />
          <Detail label="Entity type" value="Unregistered" />
          <Detail label="Status" value={status} />
          <Detail label="Tax ID" value={taxId} />
          {shareholderDetails && (
            <InfoSection
              title="Shareholders"
              description="Shareholder Information"
              details={shareholderDetails.filter(
                (detail): detail is Doc<"persons"> => detail !== null,
              )}
            />
          )}
        </div>
        {/* Right column for shareholder and director details */}
        <div>
          <Detail label="Business address" value={address} />
          <Detail label="Email" value={email} />
          <Detail label="Phone" value={phoneNumber} />
          <Detail label="Industry" value={industry} />
          {directorDetails && (
            <InfoSection
              title="Directors"
              description="Director Information"
              details={shareholderDetails.filter(
                (detail): detail is Doc<"persons"> => detail !== null,
              )}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyDetailsCard;
