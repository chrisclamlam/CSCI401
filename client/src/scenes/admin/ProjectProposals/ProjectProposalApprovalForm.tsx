import * as React from 'react';

import {
    Button,
    Table,
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Modal,
    Col
} from 'react-bootstrap';

interface ProjectListProps {
}

interface ProjectListState {
    projects: Array<{}>;
    isLoading: boolean;
    selected: boolean;
    projectToEdit?: Project;
    editAdminComments: string;
    projectIndexToEdit: number;
    editProjectName: string;
    editProjectTechnologies: string;
    editMinSize: string;
    editMaxSize: string;
    editDescription: string;

    // <Button onClick={this.toggleCheckboxes}>Select All</Button>
}

interface Project {
    projectId: number;
    adminComments: string;
    projectName: string;
    statusId: number;
    minSize: string;
    maxSize: string;
    technologies: string;
    background: string;
    description: string;
}

class ProjectProposalApprovalForm extends React.Component<ProjectListProps, ProjectListState> {
    constructor(props: ProjectListProps) {
        super(props);

        this.state = {
            projects: [],
            editAdminComments: '',
            editProjectName: '',
            editProjectTechnologies: '',
            editMinSize: '',
            editMaxSize: '',
            editDescription: '',
            isLoading: false,
            selected: false,
            projectIndexToEdit: -1
        };
        this.submitClicked = this.submitClicked.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleChangeModal = this.handleChangeModal.bind(this);
        this.toggleCheckboxes = this.toggleCheckboxes.bind(this);
    }
    submitClicked(projectId: number, type: number) {
        /*var request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open('POST', 'http://' + window.location.hostname + ':8080/projectApprovalAttempt/');
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        var data = JSON.stringify({
        projects: this.state.projects,
        });
        request.setRequestHeader('Cache-Control', 'no-cache');
        request.send(data); */
        var request = new XMLHttpRequest();
        request.withCredentials = true;
        if (type === 1) {
            request.open('POST', `${process.env.REACT_APP_API_URL}/projects/pending/` + projectId);
        } else if (type === 2) {
            request.open('POST', `${process.env.REACT_APP_API_URL}/projects/approve/` + projectId);
        } else if (type === 3) {
            request.open('POST', `${process.env.REACT_APP_API_URL}/projects/reject/` + projectId);
        } else if (type === 4) {
            request.open('POST', `${process.env.REACT_APP_API_URL}/projects/change/` + projectId);
        }
        request.send();

        // request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        // request.setRequestHeader('Cache-Control', 'no-cache');
        alert(request.responseText + 'changed project state');
        window.location.reload();
    }

    editProject(index: number, project: Project) {
        this.setState({
            projectIndexToEdit: index,
            projectToEdit: project,
            editAdminComments: project.adminComments,
            editProjectName: project.projectName,
            editProjectTechnologies: project.technologies,
            editMinSize: project.minSize,
            editMaxSize: project.maxSize,
            editDescription: project.description
        });
    }
    cancelEdit = () => {
        this.setState({ projectIndexToEdit: -1 });
    }

    submitEdit = () => {
        var request = new XMLHttpRequest();
        request.withCredentials = true;
        request.open('POST', `${process.env.REACT_APP_API_URL}/projects/change/adminComments/` + this.state.projectIndexToEdit);
        request.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        // var data = this.state.editAdminComments;
        var data = JSON.stringify({
            projectName: this.state.editProjectName,
            projectTechnologies: this.state.editProjectTechnologies,
            projectMin: this.state.editMinSize,
            projectMax: this.state.editMaxSize,
            projectDescription: this.state.editDescription,
            projectAdminComment: this.state.editAdminComments
          });
        request.setRequestHeader('Cache-Control', 'no-cache');
        request.send(data);
        // alert('Project has been updated succesfully!');
        this.submitClicked(this.state.projectIndexToEdit, 4);
        window.location.reload();
        this.setState({ projectIndexToEdit: -1 });
    }

    handleChange(e: any) {
        let projects = this.state.projects;
        let name = e.target.value;
        {
            projects.map((project: Project) => {
                if (project.projectName === name && e.target.checked) {
                    project.statusId = 2;
                } else if (project.projectName === name && !e.target.checked) {
                    project.statusId = 1;
                }
            });
        }

        this.setState({
            projects: projects
        });
    }

    handleChangeModal(e: any) {
        // @ts-ignore
        this.setState({ [e.target.id]: e.target.value });
    }

    toggleCheckboxes() {
        if (this.state.selected === false) {
            this.setState({
                selected: true
            });
        } else {
            this.setState({
                selected: false
            });
        }
    }
    componentDidMount() {
        this.setState({ isLoading: true });

        fetch(`${process.env.REACT_APP_API_URL}/projects/getprojectsfromsemester/` + sessionStorage.getItem('viewingYear') + '/' + sessionStorage.getItem('viewingFallSpring'))
            .then(response => response.json())
            .then(data => this.setState({ projects: data, isLoading: false }));
    }

    getStatus(id: number) {
        if (id === 0 || id === 1) {
            return 'Pending Approval';
        } else if (id === 2) {
            return 'Approved';
        } else if (id === 3) {
            return 'Rejected';
        }
        return 'Changes Requested';
    }

    render() {
        const { projects, isLoading } = this.state;

        if (isLoading) {
            return <p>Loading...</p>;
        }

        var ModalEditProject = <div />;
        if (typeof this.state.projectToEdit !== 'undefined') {
            ModalEditProject = (
                <Modal bsSize="lg" dialogClassName="modal-90w" show={this.state.projectIndexToEdit !== -1} onHide={this.cancelEdit}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title>Edit Project</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form horizontal={true} >
                            <FormGroup controlId="formHorizontalProjectName">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Project Name
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                        type="text"
                                        id="editProjectName"
                                        value={this.state.editProjectName}
                                        placeholder="Project Name"
                                        onChange={e => this.handleChangeModal(e)}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="formHorizontalTechnologies">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Technologies
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                        type="text"
                                        id="editProjectTechnologies"
                                        value={this.state.editProjectTechnologies}
                                        placeholder="Project Technologies"
                                        onChange={e => this.handleChangeModal(e)}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="formHorizontalMinSize">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Min Size
                                </Col>
                                <Col sm={9}>
                                    <FormControl type="text" componentClass="select" placeholder="Min Size" id="editMinSize" value={this.state.editMinSize} onChange={e => this.handleChangeModal(e)}>
                                        <option value="0">0</option>
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                    </FormControl>
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="formHorizontalMaxSize">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Max Size
                                </Col>
                                <Col sm={9}>
                                    <FormControl type="text" componentClass="select" placeholder="Min Size" id="editMaxSize" value={this.state.editMaxSize} onChange={e => this.handleChangeModal(e)}>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                    </FormControl>
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="formHorizontalProjectDescription">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Description
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                        type="text"
                                        id="editDescription"
                                        value={this.state.editDescription}
                                        placeholder="Description"
                                        onChange={e => this.handleChangeModal(e)}
                                    />
                                </Col>
                            </FormGroup>
                            <FormGroup controlId="formHorizontalAdminComment">
                                <Col componentClass={ControlLabel} sm={3}>
                                    Admin Comment
                                </Col>
                                <Col sm={9}>
                                    <FormControl
                                        type="text"
                                        id="editAdminComments"
                                        value={this.state.editAdminComments}
                                        placeholder="Admin Comment"
                                        onChange={e => this.handleChangeModal(e)}
                                    />
                                </Col>
                            </FormGroup>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.cancelEdit}>Cancel</Button>
                        <Button onClick={this.submitEdit} bsStyle="primary">Save</Button>
                    </Modal.Footer>
                </Modal>
            );
        }

        return (
            <div style={{ margin: 'auto', float: 'none', width: 1500 }}>
                <h2>Project Proposals</h2>
                <Form>
                    <Table bordered={true}>
                        <thead>
                            <tr>
                                <th style={{ width: '17%' }}>Select</th>
                                <th style={{ width: '20%' }}>Project Name</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Project Status</th>
                                <th style={{ width: '10%', textAlign: 'center' }}>Technologies</th>
                                <th style={{ width: '6%', textAlign: 'center' }}>Min Size</th>
                                <th style={{ width: '6%', textAlign: 'center' }}>Max Size</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project: Project) =>
                                <tr key={project.projectId}>
                                    <td>
                                        <Button style={{ marginRight: '5px' }} type="submit" bsStyle="success" onClick={() => this.submitClicked(project.projectId, 2)}>Approve</Button>
                                        <Button style={{ marginRight: '5px' }} type="submit" bsStyle="danger" onClick={() => this.submitClicked(project.projectId, 3)}>Reject</Button>
                                        <Button bsStyle="warning" onClick={() => this.editProject(project.projectId, project)}>Edit</Button>

                                    </td>
                                    <td>{project.projectName}</td>
                                    <td style={{ width: '10%', textAlign: 'center' }}>{this.getStatus(project.statusId)}</td>
                                    <td style={{ width: '6%', textAlign: 'center' }}>{project.technologies}</td>
                                    <td style={{ width: '6%', textAlign: 'center' }}>{project.minSize}</td>
                                    <td style={{ width: '6%', textAlign: 'center' }}>{project.maxSize}</td>
                                    <td>{project.description}</td>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                </Form>
                {ModalEditProject}
            </div>);
    }
}

export default ProjectProposalApprovalForm;
