import React from "react";
import { Button } from "antd";

const SubmitButton = ({ loading = false, children = "Submit", ...props }) => {
  return (
    <Button
      type="primary"
      htmlType="submit"
      className="btn-primary"
      loading={loading}
      {...props}
    >
      {children}
    </Button>
  );
};

export default SubmitButton;
