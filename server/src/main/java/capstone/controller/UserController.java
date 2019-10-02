package capstone.controller;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.servlet.ServletException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.bind.annotation.RestController;

import capstone.model.Global;
import capstone.model.RegisteredStudentEmail;
import capstone.model.users.Admin;
import capstone.model.users.Stakeholder;
import capstone.model.users.Student;
import capstone.model.users.User;
import capstone.repository.GlobalRepository;
import capstone.repository.RegisteredStudentEmailRepository;
import capstone.service.EmailService;
import capstone.service.UserService;
import capstone.util.Constants;
import capstone.util.EncryptPassword;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.security.Key;

@RestController
@RequestMapping("/users")
public class UserController 
{
	@Autowired
	private UserService userService;
	@Autowired
	private RegisteredStudentEmailRepository regRepo;
	@Autowired
	private GlobalRepository globalRepo;
	@Autowired
	private EmailService emailService;
	
	public UserController()
	{
	}
	
	@GetMapping("/init")
	public String setAdmin() {
		System.out.println("Test");
		Admin admin = new Admin();
		admin.setFirstName("Jeffrey");
		admin.setLastName("Miller");
		admin.setEmail("admin@usc.edu");
		admin.setPassword(EncryptPassword.encryptPassword("admin"));
		userService.saveUser(admin);
		
		System.out.println("Test-stakeholder");
		Stakeholder stakeholder = new Stakeholder();
		stakeholder.setFirstName("Test");
		stakeholder.setLastName("Stakeholder");
		stakeholder.setEmail("test@test.edu");
		stakeholder.setPassword(EncryptPassword.encryptPassword("1234"));
		userService.saveUser(stakeholder);

		
		
		
		Global global = new Global();
		global.setFallSpring(1);
		global.setSemester(2019);
		globalRepo.save(global);
		
		Global tempGlobal = globalRepo.findAll().get(0);
		return Constants.SUCCESS;
		
		
	}
	
	@GetMapping("")
	@CrossOrigin
	public Collection<User> getUsers()
	{
		Global g = globalRepo.findAll().get(0);
		int targetSemester = g.getSemester();
		int targetFallSpring = g.getFallSpring();
		List<User> users = (List<User>) userService.getUsers();
		List<User> validUsers = new ArrayList<User>();
		for (User user : users)
		{
			if (user.getUserType().equals("Student"))
			{
				Student student = (Student) user;
				if (student.semester == targetSemester && student.fallSpring == targetFallSpring)
				{
					validUsers.add(student);
				}
			}
			else
			{
				validUsers.add(user);
			}
		}
		return validUsers;
		//return userService.getUsers();
	}
	
	@GetMapping("getusersfromsemester/{semester}/{fallspring}")
	@CrossOrigin
	public Collection<User> getStudentsFromSemester(@PathVariable("semester") int semester, @PathVariable("fallspring") int fallspring)
	{
		Global g = globalRepo.findAll().get(0);
		// get users from target semester
		List<User> users = (List<User>) userService.getUsers();
		List<User> validUsers = new ArrayList<User>();
		for (User user : users)
		{
			if (user.getUserType().equals("Student"))
			{
				Student student = (Student) user;
				if (student.semester == semester && student.fallSpring == fallspring)
				{
					validUsers.add(student);
				}
			}
			else
			{
				validUsers.add(user);
			}
		}
		return validUsers;
	}
	
	@GetMapping("/{email:.+}")
	@CrossOrigin
	public User getUser(@PathVariable("email") String email)
	{
		System.out.println(email);
		return userService.findUserByEmail(email);
	}
	
	@GetMapping("/stakeholders")
	@CrossOrigin
	public Collection<Stakeholder> getStakeholders() {
		return userService.getStakeholders();
	}
	
	@GetMapping("/students")
	@CrossOrigin
	public Collection<Student> getStudents() {
		Global g = globalRepo.findAll().get(0);
		int targetSemester = g.getSemester();
		int targetFallSpring = g.getFallSpring();
		List<Student> students = (List<Student>) userService.getStudents();
		List<Student> validStudents = new ArrayList<Student>();
		for (Student student : students)
		{
			if (student.semester == targetSemester && student.fallSpring == targetFallSpring)
			{
				validStudents.add(student);
			}
			
		}
		return validStudents;
		//userService.getStudents(); 
	}
	
	@PostMapping("/update-info")
	@CrossOrigin
	public void updateUserInfo(@RequestBody Map<String, String> info) {
		System.out.println("CHANGING USER");
		String originalEmail = info.get(Constants.EMAIL);
		String phone = info.get(Constants.PHONE);
		String password = info.get(Constants.PASSWORD);
		String firstName = info.get(Constants.FIRST_NAME);
		String lastName = info.get(Constants.LAST_NAME);
		String userType = info.get(Constants.USER_TYPE);
		
		System.out.println(info);

		
		User user = findUser(originalEmail);
		user.setFirstName(firstName);
		user.setLastName(lastName);
		user.setUserType(userType);
		
		System.out.println("FOUNDUSER");

		
		userService.saveUser(user);
		System.out.println("SAVED USER");

	}
	
	public User findUser(String email) {
		return userService.findUserByEmail(email);
	}
	public User findUserByAddr(String addr) {
		return userService.findUserByAddr(addr);
	}
	
	/* Registration */
	
	// Admin registration
	@PostMapping("/admin-registration")
	@CrossOrigin
	public @ResponseBody String adminRegistrationAttempt(@RequestBody Map<String, String> info) {
		

		Global g = globalRepo.findAll().get(0);
		int semester = g.getSemester();
		int fallSpring = g.getFallSpring();
		String email = info.get(Constants.EMAIL);
		String firstName = info.get(Constants.FIRST_NAME);
		String lastName = info.get(Constants.LAST_NAME);
		String phone = info.get(Constants.PHONE);
		String encryptedPassword = EncryptPassword.encryptPassword(info.get(Constants.PASSWORD));
		
		// Check if email is a registered student email and not already registered
		if (regRepo.findByEmail(email) != null && 
				userService.findStudentByEmail(email) == null) {
			Admin admin = new Admin();
			admin.setFirstName(firstName);
			admin.setLastName(lastName);
			admin.setEmail(email);
			admin.setPhone(phone);
			admin.setPassword(encryptedPassword);
			admin.setUserType(Constants.ADMIN);
			userService.saveUser(admin);
			System.out.println("New admin created");
			return Constants.SUCCESS;
		}
		return Constants.EMPTY;
	}
	
	// Student registration
	@PostMapping("/student-registration")
	@CrossOrigin
	public @ResponseBody String studentRegistrationAttempt(@RequestBody Map<String, String> info) {
		String email = info.get(Constants.EMAIL);
		String name = info.get(Constants.FIRST_NAME);
		String lastName = info.get(Constants.LAST_NAME);
		String phone = info.get(Constants.PHONE);
		String encryptedPassword = EncryptPassword.encryptPassword(info.get(Constants.PASSWORD));
		
		//regRepo.findByEmail(email) != null && s
		// Check if email is a registered student email and not already registered
		if (userService.findStudentByEmail(email) == null) {
			Student s = new Student();
			s.setFirstName(name);
			s.semester = globalRepo.findAll().get(0).getSemester();
			s.fallSpring = globalRepo.findAll().get(0).getFallSpring();
			s.setLastName(lastName);
			s.setEmail(email);
			s.setPhone(phone);
			s.setPassword(encryptedPassword);
			s.setUserType(Constants.STUDENT);
			userService.saveUser(s);
			System.out.println("New student created");
			return Constants.SUCCESS;
		}
		return Constants.EMPTY;
	}
	
	// Stakeholder registration
	@PostMapping("/stakeholder-registration")
	@CrossOrigin
	public @ResponseBody String stakeholderRegistrationAttempt(@RequestBody Map<String, String> info) {
		System.out.println("Start reg");
		String email = info.get(Constants.EMAIL);
		String name = info.get(Constants.FIRST_NAME);
		String lastName = info.get(Constants.LAST_NAME);
		String phone = info.get(Constants.PHONE);
		String companyName = info.get(Constants.COMPANY);
		String encryptedPassword = EncryptPassword.encryptPassword(info.get(Constants.PASSWORD));
		
		// Check if email has already been registered
		if (userService.findStakeholderByEmail(email) == null) {
			Stakeholder s = new Stakeholder();
			s.setFirstName(name);
			s.setLastName(lastName);
			s.setEmail(email);
			s.setPhone(phone);
			s.setOrganization(companyName);
			s.setPassword(encryptedPassword);
			s.setUserType(Constants.STAKEHOLDER);
			userService.saveUser(s);
			System.out.println("New stakeholder created");
			return Constants.SUCCESS;
		}
		return Constants.EMPTY;
	}
	
	// Admin can register student emails and send an invitation to the platform
	@RequestMapping(value = "/student-emails-registration",consumes= "application/json",produces= "application/json", method = RequestMethod.POST)
	@CrossOrigin
	public void studentEmailRegistrationAttempt(@RequestBody Map<String, String> emailsData)
	{
		System.out.println(emailsData);
		System.out.println("Received HTTP POST");
		
		String[] emailsArray = emailsData.get(Constants.EMAILS).split("\n");
		
		for(String e : emailsArray)
		{
			// Save the email to registered student email table
			regRepo.save(new RegisteredStudentEmail(e));
			// Send an email invitation
			emailService.sendEmail("401 Platform Invite", "Congratulations! \nPlease sign up using the following link. \n \nhttp://68.181.97.191:5000/register/student", e);
			System.out.println("Sent invite to: " + e);
		}
	}
	
	//allow password changes
	@RequestMapping(value = "/password-reset",consumes= "application/json",produces= "application/json", method = RequestMethod.POST)
	@CrossOrigin
	public void studentPasswordReset(@RequestBody Map<String, String> emailsData)
	{
		System.out.println(emailsData);
		System.out.println("Received HTTP POST");
		
		String email = emailsData.get(Constants.EMAIL);
		
		System.out.println(email);
		
		User user = userService.findUserByEmail(email);
		
		String newPassword = generateRandomPassword();
		
		user.setPassword(EncryptPassword.encryptPassword(newPassword));
		userService.saveUser(user);
		
		// Send an email invitation
		emailService.sendEmail("401 Platform Password Reset", "Here is your new password for the 401 project platform: " + newPassword, email);
	
	}
	//generate password function
	private String generateRandomPassword() {
		int leftLimit = 97; // letter 'a'
	    int rightLimit = 122; // letter 'z'
	    int targetStringLength = 10;
	    Random random = new Random();
	    StringBuilder buffer = new StringBuilder(targetStringLength);
	    for (int i = 0; i < targetStringLength; i++) {
	        int randomLimitedInt = leftLimit + (int) 
	          (random.nextFloat() * (rightLimit - leftLimit + 1));
	        buffer.append((char) randomLimitedInt);
	    }
	    String generatedString = buffer.toString();
	    return generatedString;
	}
	
	
	/* Login */
	
	@PostMapping("/login")
	@CrossOrigin
	public String login(@RequestBody User login) throws ServletException {
	    String jwtToken = "";

	    if (login.getEmail() == null || login.getPassword() == null) {
	        return "";
	    }

	    String email = login.getEmail();
	    String password = login.getPassword();
	    
	    User user = userService.findUserByEmail(email);

	    if (user == null) {
	        throw new ServletException("Invalid login");
	    }

	    String pwd = user.getPassword();

	    if (!EncryptPassword.checkPassword(password, pwd)) {
	        throw new ServletException("Invalid login");
	    }
	    
	    String userType = userService.getUserType(user);
	    
	    Key key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
	    
	    jwtToken = Jwts.builder().setSubject(email).claim("roles", "user").setIssuedAt(new Date())
	            .signWith(key).compact();
	    return jwtToken + "," + userType;
	}
}
