import Form from "./form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ICreateProfileComponentProps {
  firstName: string;
  lastName: string;
  email: string;
}

const CreateProfileComponent: React.FC<ICreateProfileComponentProps> = ({
  firstName,
  lastName,
  email,
}) => {
  return (
    <Card className="w-[800px] max-w-[90%]">
      <CardHeader>
        <CardTitle>Create Profile</CardTitle>
        <CardDescription>Enter your details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form
          file_name="form"
          redirect_link="/"
          formMethod="POST"
          table_name="Users"
          fields={[
            {
              name: "Email",
              placeholder: "Enter your email",
              fieldType: "input",
              type: "email",
              label: "Email",
              validation: {
                regex: "/.+/", // Ensures non-empty input
                message: "Email is required",
              },
              defaultValue: email ?? "",
            },
            {
              name: "FirstName",
              placeholder: "Enter your first name",
              fieldType: "input",
              type: "text",
              label: "First Name",
              validation: {
                regex: "/.+/", // Ensures non-empty input
                message: "First name is required",
              },
              defaultValue: firstName ?? "",
            },
            {
              name: "LastName",
              placeholder: "Enter your last name",
              fieldType: "input",
              type: "text",
              label: "Last Name",
              validation: {
                regex: "/.+/", // Ensures non-empty input
                message: "Last name is required",
              },
              defaultValue: lastName ?? "",
            },
            {
              name: "Age",
              placeholder: "Enter your age",
              fieldType: "input",
              type: "number",
              label: "Age",
              validation: {
                regex: "/.+/", // Ensures non-empty input
                message: "Age is required",
              },
            },
            {
              name: "Weight",
              placeholder: "Enter your weight",
              fieldType: "input",
              type: "number",
              label: "Weight",
              validation: {
                regex: "/^\\d{2,3}(\\.\\d{1,2})?$/", // Up to 3 digits and 2 decimals
                message:
                  "Weight must be a number with up to 3 digits and 2 decimal places",
              },
            },
            {
              name: "Height",
              placeholder: "Enter your height",
              fieldType: "input",
              type: "number",
              label: "Height",
              validation: {
                regex: "/^\\d{2,3}(\\.\\d{1,2})?$/", // Up to 3 digits and 2 decimals
                message:
                  "Height must be a number with up to 3 digits and 2 decimal places",
              },
            },
            {
              name: "FitnessGoal",
              placeholder: "Enter your fitness goal",
              fieldType: "textarea",
              label: "Fitness Goal",
              validation: {
                regex: "/.+/", // Ensures non-empty input
                message: "Fitness goal is required",
              },
            },
          ]}
        />
      </CardContent>
    </Card>
  );
};

export default CreateProfileComponent;
