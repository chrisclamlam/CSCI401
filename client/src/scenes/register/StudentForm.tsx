import * as React from 'react';
import {
    Form,
    FormGroup,
    Col,
    FormControl,
    Button,
    ControlLabel
} from 'react-bootstrap';

const style = {
    width: 600,
    float: 'none',
    margin: 'auto',
};

interface StudentRegistrationProps {
}
interface StudentRegistrationState {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirm: string;
}
class StudentRegistrationForm extends React.Component<StudentRegistrationProps, StudentRegistrationState> {
    constructor(props: StudentRegistrationProps) {
        super(props);
        this.state = {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirm: ''
        };
        this.submitClicked = this.submitClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
    }

    submitClicked() {
        var request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open('POST', 'http://' + window.location.hostname + ':8080/users/student-registration');
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        if (this.state.firstName === '' || this.state.lastName === '' || this.state.email === '' || this.state.phone === '' || this.state.confirm === '' || this.state.password === '') {
            alert('Please fill in all the information.');
            window.location.reload();
        }
        if (this.state.firstName !== '' && this.state.lastName !== '' && this.state.email !== '' && this.state.phone !== '' && this.state.confirm !== '' && this.state.password !== '' && this.state.password !== this.state.confirm) {
            alert('Your passwords do not match. Please try again.');
            window.location.reload();
        }
        var data = JSON.stringify({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            email: this.state.email,
            phone: this.state.phone,
            password: this.state.password
        });
        request.setRequestHeader('Cache-Control', 'no-cache');
        request.send(data);
        request.onreadystatechange = function () {
            window.location.href = '/';
        };
    }

    handleChange(e: any) {
        // @ts-ignore
        this.setState({ [e.target.id]: e.target.value });
    }

    formGroup(controlId: string, type: string, id: string, placeholder: string, value: any) {
        return (
            <FormGroup controlId={controlId}>
                <Col componentClass={ControlLabel} sm={2}>
                    {placeholder}
                </Col>
                <Col sm={10}>
                    <FormControl
                        type={type}
                        id={id}
                        value={value}
                        placeholder={placeholder}
                        onChange={e => this.handleChange(e)}
                    />
                </Col>
            </FormGroup>
        );

    }

    render() {
        return (
            <div style={style as any}>
                <h2>Student Registration</h2>
                <Form horizontal={true} >
                    {this.formGroup('formHorizontalFirstName', 'text', 'firstName', 'First Name', this.state.firstName)}
                    {this.formGroup('formHorizontalLastName', 'text', 'lastName', 'Last Name', this.state.lastName)}
                    {this.formGroup('formHorizontalEmail', 'text', 'email', 'Email', this.state.email)}
                    {this.formGroup('formHorizontalPhone', 'text', 'phone', 'Phone', this.state.phone)}
                    {this.formGroup('formHorizontalPassword', 'password', 'password', 'Password', this.state.password)}
                    {this.formGroup('formHorizontalConfirm', 'password', 'confirm', 'Confirm Password', this.state.confirm)}

                    <FormGroup>
                        <Col smOffset={2} sm={10}>
                            <Button type="reset" onClick={this.submitClicked}>Register</Button>
                        </Col>
                    </FormGroup>
                </Form>
            </div>
        );
    }
}

export default StudentRegistrationForm;