"use client";
import { Button } from "@/components/ui/button";

import axios from "axios";

const Page = () => {
  const fileUrl =
    "https://judicious-corgi-741.convex.cloud/api/storage/kg24msxm66cp1wf8b6tkqne1q56ke92y";

  const onClick = () => {
    axios.post("/api/convert", { fileUrl }).then((response) => {
      console.log(response);
    });
    console.log("click");
  };
  return (
    <div>
      <h1>Documents </h1>
      <Button onClick={onClick}>Convert</Button>
    </div>
  );
};
export default Page;
