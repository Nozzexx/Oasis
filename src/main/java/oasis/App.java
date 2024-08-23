package oasis;

import atlantafx.base.theme.NordDark;
import atlantafx.base.theme.Styles;
import javafx.application.Application;
import javafx.application.Preloader;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.control.TextField;
import javafx.scene.image.Image;
import javafx.scene.layout.BorderPane;
import javafx.scene.layout.HBox;
import javafx.scene.layout.Priority;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.text.Font;
import javafx.stage.Screen;
import javafx.stage.Stage;

public class App extends Application {

    private static final int DEFAULT_WIDTH = 1600;
    private static final int DEFAULT_HEIGHT = 900;
    private static final String APP_NAME = "OASIS";
    private static final String VERSION = "0.1.1a";
    private static final int SIDEBAR_WIDTH = 250; // Sidebar width

    @Override
    public void init() throws Exception {
        // Simulate some loading time
        for (int i = 0; i < 10; i++) {
            double progress = (i + 1) / 10.0;
            notifyPreloader(new Preloader.ProgressNotification(progress));
            Thread.sleep(100); // Reduced sleep time for demonstration
        }
    }

    @Override
    public void start(Stage primaryStage) {
        // Load Material Icons font
        Font.loadFont(getClass().getResourceAsStream("/fonts/MaterialSymbolsRounded-VariableFont_FILL,GRAD,opsz,wght.ttf"), 16);
    
        // Create CSS for Material Icons
        String materialIconsCss = """
            .material-icons {
                -fx-font-family: 'Material Icons';
                -fx-font-size: 18px;
            }
        """;

        // Apply AtlantaFX theme
        Application.setUserAgentStylesheet(new NordDark().getUserAgentStylesheet());

        // Create the main layout
        HBox root = new HBox();
        root.setAlignment(Pos.CENTER_LEFT);

        // Create the sidebar
        BorderPane sidebar = createSidebar();
        HBox.setHgrow(sidebar, Priority.NEVER);

        // Create the main content area
        StackPane contentArea = new StackPane();
        HBox.setHgrow(contentArea, Priority.ALWAYS);

        // Add a placeholder content
        Label contentLabel = new Label("Select an option from the sidebar");
        contentArea.getChildren().add(contentLabel);

        // Add sidebar and content area to the root layout
        root.getChildren().addAll(sidebar, contentArea);

        Scene scene = new Scene(root, DEFAULT_WIDTH, DEFAULT_HEIGHT);
        
        // Add Material Icons CSS to the scene
        scene.getStylesheets().add("data:text/css," + materialIconsCss.replace("\n", ""));

        // Set the icon
        try {
            Image icon = new Image(getClass().getResourceAsStream("/exoplanet64.png"));
            primaryStage.getIcons().add(icon);
        } catch (Exception e) {
            System.err.println("Failed to load application icon: " + e.getMessage());
        }

        // Set window properties
        primaryStage.setTitle(APP_NAME + " | Version: " + VERSION);
        primaryStage.setMinWidth(DEFAULT_WIDTH);
        primaryStage.setMinHeight(DEFAULT_HEIGHT);
        primaryStage.setScene(scene);

        // Center the window on the primary screen
        Rectangle2D screenBounds = Screen.getPrimary().getVisualBounds();
        primaryStage.setX((screenBounds.getWidth() - DEFAULT_WIDTH) / 2);
        primaryStage.setY((screenBounds.getHeight() - DEFAULT_HEIGHT) / 2);

        primaryStage.show();
    }

    private BorderPane createSidebar() {
        BorderPane sidebar = new BorderPane();
        sidebar.setPrefWidth(SIDEBAR_WIDTH);
        sidebar.setStyle("-fx-background-color: #010409;"); // Dark background color
    
        // Top section with logo and search
        VBox topSection = new VBox(10);
        topSection.setPadding(new Insets(20, 20, 10, 20));
    
        Label logo = new Label("OASIS");
        logo.setStyle("-fx-font-size: 24px; -fx-text-fill: white;");
    
        TextField search = new TextField();
        search.setPromptText("Search");
        search.getStyleClass().add("sidebar-search");
    
        topSection.getChildren().addAll(logo, search);
    
        // Center section with menu items
        VBox menuItems = new VBox(5);
        menuItems.setPadding(new Insets(20, 20, 20, 20));
    
        String[][] items = {
            {"home", "General"},
            {"view_carousel", "Containers"},
            {"data_usage", "Data Display"},
            {"feedback", "Feedback"},
            {"input", "Inputs & Controls"},
            {"navigation", "Navigation"},
            {"star", "Showcase"}
        };
        
        for (String[] item : items) {
            HBox menuItemBox = new HBox(10);
            menuItemBox.setAlignment(Pos.CENTER_LEFT);
            
            Label icon = new Label(item[0]);
            icon.getStyleClass().add("material-icons");
            
            Label text = new Label(item[1]);
            
            menuItemBox.getChildren().addAll(icon, text);
            
            Button menuButton = new Button();
            menuButton.setGraphic(menuItemBox);
            menuButton.getStyleClass().addAll(Styles.BUTTON_OUTLINED, Styles.ACCENT);
            menuButton.setMaxWidth(Double.MAX_VALUE);
            menuButton.setAlignment(Pos.CENTER_LEFT);
            
            menuItems.getChildren().add(menuButton);
        }
    
        // Bottom section with centered version label
        Label version = new Label("v" + VERSION);
        version.getStyleClass().add("version-label");
        StackPane bottomSection = new StackPane(version);
        bottomSection.setPadding(new Insets(10, 0, 10, 0));
        StackPane.setAlignment(version, Pos.CENTER);
    
        sidebar.setTop(topSection);
        sidebar.setCenter(menuItems);
        sidebar.setBottom(bottomSection);
    
        return sidebar;
    }

    public static void main(String[] args) {
        System.setProperty("javafx.preloader", SplashScreen.class.getCanonicalName());
        launch(args);
    }
}